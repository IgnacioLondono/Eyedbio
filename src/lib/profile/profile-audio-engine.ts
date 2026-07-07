import {
  DEFAULT_CLIP_DURATION,
  getAudioClipBounds,
} from "@/lib/config/audio-config";
import { hasMediaUnlockedSession, markMediaUnlockedSession } from "@/lib/media/media-gesture";
import { getMediaSrc } from "@/lib/media/media-url";

const VOLUME_STORAGE_KEY = "eyed-audio-volume";
const LOOP_SEEK_MARGIN = 0.05;

export type ProfileAudioEngineConfig = {
  src: string;
  startTime: number;
  clipDuration: number;
  enabled: boolean;
};

export type ProfileAudioEngineSnapshot = {
  isPlaying: boolean;
  volume: number;
  duration: number;
  awaitingUnlock: boolean;
  needsTap: boolean;
  userPaused: boolean;
};

type Listener = () => void;

let audio: HTMLAudioElement | null = null;
let config: ProfileAudioEngineConfig | null = null;
let volume = 0.7;
let volumeInitialized = false;
let duration = 0;
let userPaused = false;
let wantsPlay = true;
let mutedForPolicy = false;
let wasPlayingBeforeMute = false;
let volumeBeforeMute = volume;
let clipBounds = { start: 0, end: Infinity as number, nativeLoop: false };
let listeners = new Set<Listener>();
let autoplayHandler: (() => void) | null = null;
let autoplayHandlersBound = false;

function readInitialVolume(): number {
  if (typeof window === "undefined") return 0.7;

  const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
  if (saved !== null) {
    const parsed = parseFloat(saved);
    if (!Number.isNaN(parsed)) {
      return Math.min(1, Math.max(0, parsed));
    }
  }

  const touchCapable =
    window.matchMedia("(pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0 ||
    "ontouchstart" in window;

  return touchCapable ? 1 : 0.7;
}

function ensureVolumeInitialized(): void {
  if (volumeInitialized) return;
  volumeInitialized = true;
  if (typeof window !== "undefined") {
    volume = readInitialVolume();
    volumeBeforeMute = volume;
  }
}

const SERVER_SNAPSHOT: ProfileAudioEngineSnapshot = {
  isPlaying: false,
  volume: 0.7,
  duration: 0,
  awaitingUnlock: false,
  needsTap: false,
  userPaused: false,
};

let snapshotCache: ProfileAudioEngineSnapshot = SERVER_SNAPSHOT;

function isElementPlaying(): boolean {
  return Boolean(audio && !audio.paused && !audio.ended);
}

function refreshSnapshotCache(): ProfileAudioEngineSnapshot {
  ensureVolumeInitialized();
  const isPlaying = isElementPlaying();
  const awaitingUnlock = mutedForPolicy && volume > 0 && wantsPlay && !userPaused;
  const needsTap =
    volume > 0 && !userPaused && (awaitingUnlock || (wantsPlay && !isPlaying));
  const next: ProfileAudioEngineSnapshot = {
    isPlaying,
    volume,
    duration,
    awaitingUnlock,
    needsTap,
    userPaused,
  };

  if (
    snapshotCache.isPlaying === next.isPlaying &&
    snapshotCache.volume === next.volume &&
    snapshotCache.duration === next.duration &&
    snapshotCache.awaitingUnlock === next.awaitingUnlock &&
    snapshotCache.needsTap === next.needsTap &&
    snapshotCache.userPaused === next.userPaused
  ) {
    return snapshotCache;
  }

  snapshotCache = next;
  return snapshotCache;
}

function notify(): void {
  refreshSnapshotCache();
  listeners.forEach((listener) => listener());
}

function getAudioElement(): HTMLAudioElement {
  if (typeof window === "undefined") {
    throw new Error("Profile audio engine requires a browser environment");
  }

  if (!audio) {
    audio = document.createElement("audio");
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    document.body.appendChild(audio);
    bindAudioEvents(audio);
  }

  return audio;
}

function updateClipBounds(): void {
  const startTime = config?.startTime ?? 0;
  const clipDuration = config?.clipDuration ?? DEFAULT_CLIP_DURATION;
  clipBounds = getAudioClipBounds(duration, startTime, clipDuration);
  const element = audio;
  if (element) {
    element.loop = clipBounds.nativeLoop;
  }
}

function seekToClipStart(): void {
  const element = audio;
  if (!element) return;
  element.currentTime = clipBounds.start;
}

/** True si la posición actual está dentro de los límites del clip (no requiere reiniciar). */
function isWithinClipBounds(): boolean {
  const element = audio;
  if (!element) return false;
  const { start, end } = clipBounds;
  if (element.currentTime < start) return false;
  if (Number.isFinite(end) && element.currentTime >= end - LOOP_SEEK_MARGIN) return false;
  return true;
}

function applyVolumeToElement(nextVolume: number): void {
  const element = audio;
  if (!element) return;
  element.volume = nextVolume;
  if (nextVolume === 0) {
    element.muted = true;
    return;
  }
  if (!mutedForPolicy) {
    element.muted = false;
  }
}

function syncPlayingState(): void {
  notify();
}

function handleClipLoop(): void {
  const element = audio;
  if (!element || element.paused || userPaused || clipBounds.nativeLoop) return;

  const { start, end } = clipBounds;
  if (!Number.isFinite(end)) return;
  if (element.currentTime >= end - LOOP_SEEK_MARGIN) {
    element.currentTime = start;
  }
}

function bindAudioEvents(element: HTMLAudioElement): void {
  const onLoaded = () => {
    if (Number.isFinite(element.duration)) {
      duration = element.duration;
      updateClipBounds();
      if (wantsPlay && !userPaused && volume > 0) {
        seekToClipStart();
      }
      notify();
    }
  };

  const onTimeUpdate = () => {
    handleClipLoop();
  };

  const onEnded = () => {
    if (clipBounds.nativeLoop || userPaused || !wantsPlay || volume === 0) return;
    seekToClipStart();
    void element.play().catch(() => notify());
  };

  element.addEventListener("loadedmetadata", onLoaded);
  element.addEventListener("durationchange", onLoaded);
  element.addEventListener("play", syncPlayingState);
  element.addEventListener("pause", syncPlayingState);
  element.addEventListener("playing", syncPlayingState);
  element.addEventListener("timeupdate", onTimeUpdate);
  element.addEventListener("ended", onEnded);
}

function clearAutoplayHandlers(): void {
  const element = audio;
  if (!element || !autoplayHandler || !autoplayHandlersBound) return;

  element.removeEventListener("loadedmetadata", autoplayHandler);
  element.removeEventListener("loadeddata", autoplayHandler);
  element.removeEventListener("canplay", autoplayHandler);
  element.removeEventListener("canplaythrough", autoplayHandler);
  autoplayHandlersBound = false;
  autoplayHandler = null;
}

function ensureAutoplayHandlers(): void {
  const element = audio;
  if (!element || autoplayHandlersBound) return;

  autoplayHandler = () => {
    if (isElementPlaying()) return;
    tryProfileAudioAutoplay();
  };

  element.addEventListener("loadedmetadata", autoplayHandler);
  element.addEventListener("loadeddata", autoplayHandler);
  element.addEventListener("canplay", autoplayHandler);
  element.addEventListener("canplaythrough", autoplayHandler);
  autoplayHandlersBound = true;
}

function resetPlaybackFlags(): void {
  userPaused = false;
  wantsPlay = true;
  mutedForPolicy = false;
  duration = 0;
}

export function getProfileAudioEngineSnapshot(): ProfileAudioEngineSnapshot {
  return refreshSnapshotCache();
}

export function getProfileAudioEngineServerSnapshot(): ProfileAudioEngineSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribeProfileAudioEngine(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function configureProfileAudioEngine(next: ProfileAudioEngineConfig): void {
  ensureVolumeInitialized();
  const element = getAudioElement();
  const nextSrc = getMediaSrc(next.src);
  const srcChanged = config?.src !== next.src;
  const timingChanged =
    config?.startTime !== next.startTime || config?.clipDuration !== next.clipDuration;

  config = next;

  if (srcChanged) {
    clearAutoplayHandlers();
    resetPlaybackFlags();
    element.pause();
    element.src = nextSrc;
    element.load();
  }

  updateClipBounds();
  applyVolumeToElement(volume);
  ensureAutoplayHandlers();

  if (srcChanged) {
    tryProfileAudioAutoplay();
  } else if (timingChanged) {
    seekToClipStart();
    if (!userPaused && volume > 0 && !isElementPlaying()) {
      tryProfileAudioAutoplay();
    }
  } else if (!isElementPlaying()) {
    tryProfileAudioAutoplay();
  }

  notify();
}

export function destroyProfileAudioEngine(): void {
  clearAutoplayHandlers();
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audio.remove();
    audio = null;
  }
  config = null;
  resetPlaybackFlags();
  notify();
}

/** Debe llamarse de forma síncrona dentro de pointerdown / click / touchstart. */
export function playProfileAudioFromUserGesture(): boolean {
  ensureVolumeInitialized();
  if (!config?.enabled || volume === 0) return false;

  userPaused = false;
  wantsPlay = true;

  const element = getAudioElement();

  mutedForPolicy = false;
  element.muted = false;
  element.volume = volume;

  if (element.ended || !isWithinClipBounds()) {
    seekToClipStart();
  }

  if (isElementPlaying() && !element.muted) {
    markMediaUnlockedSession();
    notify();
    return true;
  }

  try {
    const playPromise = element.play();
    markMediaUnlockedSession();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          mutedForPolicy = false;
          notify();
        })
        .catch(() => notify());
    }
    notify();
    return true;
  } catch {
    notify();
    return false;
  }
}

export function tryProfileAudioAutoplay(): void {
  ensureVolumeInitialized();
  const element = audio;
  if (!element || !config?.enabled || userPaused || volume === 0) return;
  if (isElementPlaying()) return;

  wantsPlay = true;
  if (element.paused || element.ended) {
    seekToClipStart();
  }
  applyVolumeToElement(volume);

  const attemptMuted = () => {
    if (isElementPlaying()) return;
    element.muted = true;
    mutedForPolicy = true;
    void element
      .play()
      .then(() => notify())
      .catch(() => notify());
  };

  if (hasMediaUnlockedSession()) {
    element.muted = false;
    mutedForPolicy = false;
    void element
      .play()
      .then(() => {
        markMediaUnlockedSession();
        mutedForPolicy = false;
        notify();
      })
      .catch(attemptMuted);
    return;
  }

  element.muted = false;
  mutedForPolicy = false;
  void element
    .play()
    .then(() => {
      markMediaUnlockedSession();
      notify();
    })
    .catch(attemptMuted);
}

export function pauseProfileAudio(userInitiated: boolean): void {
  const element = audio;
  if (!element) return;
  element.pause();
  if (userInitiated) {
    userPaused = true;
    wantsPlay = false;
  }
  notify();
}

export function resumeProfileAudio(): void {
  const element = audio;
  if (!element || !config?.enabled || volume === 0) return;
  if (isElementPlaying()) return;

  userPaused = false;
  wantsPlay = true;
  applyVolumeToElement(volume);
  if (element.ended || !isWithinClipBounds()) {
    seekToClipStart();
  }
  void element
    .play()
    .then(() => notify())
    .catch(() => notify());
}

export function toggleProfileAudioPlayPause(): void {
  const element = audio;
  if (!element || !config?.enabled) return;

  if (mutedForPolicy && volume > 0) {
    playProfileAudioFromUserGesture();
    return;
  }

  if (!element.paused) {
    pauseProfileAudio(true);
    return;
  }

  if (volume === 0) {
    const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
    const parsed = saved !== null ? parseFloat(saved) : NaN;
    const restored = !Number.isNaN(parsed) && parsed > 0 ? parsed : volumeBeforeMute > 0 ? volumeBeforeMute : 0.7;
    setProfileAudioVolume(restored);
  }

  playProfileAudioFromUserGesture();
}

export function setProfileAudioVolume(nextVolume: number): void {
  const clamped = Math.min(1, Math.max(0, nextVolume));
  if (clamped > 0) {
    volumeBeforeMute = clamped;
  }
  volume = clamped;
  mutedForPolicy = false;
  localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));

  const element = audio;
  if (!element) {
    notify();
    return;
  }

  applyVolumeToElement(clamped);

  if (clamped === 0) {
    wasPlayingBeforeMute = !element.paused;
    element.pause();
    notify();
    return;
  }

  if (wasPlayingBeforeMute && !userPaused) {
    wasPlayingBeforeMute = false;
    resumeProfileAudio();
  }

  notify();
}

export function isProfileAudioAwaitingUnlock(): boolean {
  return getProfileAudioEngineSnapshot().needsTap;
}

export function unlockProfileAudioIfNeeded(): void {
  if (getProfileAudioEngineSnapshot().needsTap) {
    playProfileAudioFromUserGesture();
  }
}
