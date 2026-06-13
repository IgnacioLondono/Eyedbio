import { markMediaUnlockedSession } from "@/lib/media-gesture";

const VOLUME_STORAGE_KEY = "eyed-audio-volume";

export type BackgroundVideoAudioSnapshot = {
  volume: number;
  muted: boolean;
  isPlaying: boolean;
  needsTap: boolean;
};

type Listener = () => void;

let video: HTMLVideoElement | null = null;
let audioFromVideo = false;
let volume = 0.7;
let volumeInitialized = false;
let volumeBeforeMute = 0.7;
let listeners = new Set<Listener>();
let pendingEnterWithAudio = false;
let pendingEnterMuted = false;
let audioUnlocked = false;
let awaitEntryGate = true;

const SERVER_SNAPSHOT: BackgroundVideoAudioSnapshot = {
  volume: 0.7,
  muted: true,
  isPlaying: false,
  needsTap: false,
};

let snapshotCache = SERVER_SNAPSHOT;

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

function isPlaying(): boolean {
  return Boolean(video && !video.paused && !video.ended);
}

function refreshSnapshot(): BackgroundVideoAudioSnapshot {
  ensureVolumeInitialized();
  const element = video;
  const muted = !element || element.muted || volume === 0;
  const playing = isPlaying();
  const needsTap = Boolean(
    audioFromVideo && element && volume > 0 && muted && playing
  );

  const next: BackgroundVideoAudioSnapshot = {
    volume,
    muted,
    isPlaying: playing,
    needsTap,
  };

  if (
    snapshotCache.volume === next.volume &&
    snapshotCache.muted === next.muted &&
    snapshotCache.isPlaying === next.isPlaying &&
    snapshotCache.needsTap === next.needsTap
  ) {
    return snapshotCache;
  }

  snapshotCache = next;
  return snapshotCache;
}

function notify(): void {
  refreshSnapshot();
  listeners.forEach((listener) => listener());
}

function holdVideoUntilEnter(element: HTMLVideoElement): void {
  element.pause();
  element.currentTime = 0;
  element.muted = true;
  element.volume = 0;
}

function playVideoMutedLoop(element: HTMLVideoElement): void {
  element.currentTime = 0;
  element.muted = true;
  element.volume = 0;
  void element.play().catch(() => notify());
}

function applyPostRegisterState(element: HTMLVideoElement): void {
  if (pendingEnterWithAudio) {
    pendingEnterWithAudio = false;
    pendingEnterMuted = false;
    activateBackgroundVideoFromEnter();
    return;
  }

  if (pendingEnterMuted) {
    pendingEnterWithAudio = false;
    pendingEnterMuted = false;
    playVideoMutedLoop(element);
    notify();
    return;
  }

  if (awaitEntryGate) {
    holdVideoUntilEnter(element);
    return;
  }

  if (audioFromVideo && audioUnlocked) {
    activateBackgroundVideoFromEnter();
    return;
  }

  playVideoMutedLoop(element);
  notify();
}

export function resetBackgroundVideoAudioState(): void {
  pendingEnterWithAudio = false;
  pendingEnterMuted = false;
  audioUnlocked = false;
  awaitEntryGate = true;
  audioFromVideo = false;
  video = null;
  notify();
}

export function setBackgroundVideoAwaitEntryGate(next: boolean): void {
  awaitEntryGate = next;
  const element = video;
  if (!element) return;
  if (next) {
    holdVideoUntilEnter(element);
  }
}

export function registerProfileBackgroundVideo(
  element: HTMLVideoElement,
  options: { audioFromVideo: boolean }
): () => void {
  video = element;
  audioFromVideo = options.audioFromVideo;
  ensureVolumeInitialized();

  const sync = () => notify();
  element.addEventListener("play", sync);
  element.addEventListener("pause", sync);
  element.addEventListener("volumechange", sync);
  element.addEventListener("timeupdate", sync);

  applyPostRegisterState(element);
  notify();

  return () => {
    element.removeEventListener("play", sync);
    element.removeEventListener("pause", sync);
    element.removeEventListener("volumechange", sync);
    element.removeEventListener("timeupdate", sync);
    if (video === element) {
      video = null;
      audioFromVideo = false;
    }
    notify();
  };
}

export function isProfileBackgroundVideoActive(): boolean {
  return video !== null;
}

export function getBackgroundVideoAudioSnapshot(): BackgroundVideoAudioSnapshot {
  return refreshSnapshot();
}

export function getBackgroundVideoAudioServerSnapshot(): BackgroundVideoAudioSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribeBackgroundVideoAudio(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function activateBackgroundVideoFromEnter(): boolean {
  const element = video;
  if (!element) return false;

  ensureVolumeInitialized();
  audioUnlocked = true;
  awaitEntryGate = false;
  element.currentTime = 0;

  if (volume > 0) {
    element.volume = volume;
    element.muted = false;
  } else {
    element.muted = true;
    element.volume = 0;
  }

  markMediaUnlockedSession();
  void element.play().catch(() => notify());
  notify();
  return true;
}

/** Arranca el video de fondo con sonido (gesto de entrada). */
export function startBackgroundVideoFromEnter(): boolean {
  awaitEntryGate = false;
  if (video) {
    return activateBackgroundVideoFromEnter();
  }

  pendingEnterWithAudio = true;
  pendingEnterMuted = false;
  return false;
}

/** Arranca video de fondo en bucle sin audio (gesto de entrada). */
export function startBackgroundVideoMutedFromEnter(): boolean {
  awaitEntryGate = false;
  const element = video;
  if (element) {
    playVideoMutedLoop(element);
    notify();
    return true;
  }

  pendingEnterMuted = true;
  pendingEnterWithAudio = false;
  return false;
}

export function unmuteBackgroundVideoFromUserGesture(): boolean {
  const element = video;
  if (!element || !audioFromVideo || volume === 0) return false;

  ensureVolumeInitialized();
  element.volume = volume;
  element.muted = false;
  markMediaUnlockedSession();

  if (element.paused) {
    void element.play().catch(() => notify());
  }

  notify();
  return true;
}

export function unmuteBackgroundVideoIfNeeded(): void {
  const element = video;
  if (!element || !audioFromVideo || volume === 0 || !element.muted) return;
  unmuteBackgroundVideoFromUserGesture();
}

export function setBackgroundVideoVolume(nextVolume: number): void {
  if (!audioFromVideo) return;

  ensureVolumeInitialized();
  const clamped = Math.min(1, Math.max(0, nextVolume));

  if (clamped > 0) {
    volumeBeforeMute = clamped;
  }

  volume = clamped;
  localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));

  const element = video;
  if (!element) {
    notify();
    return;
  }

  if (clamped === 0) {
    element.muted = true;
    notify();
    return;
  }

  element.volume = clamped;
  element.muted = false;
  markMediaUnlockedSession();
  notify();
}

export function getBackgroundVideoVolumeBeforeMute(): number {
  ensureVolumeInitialized();
  return volumeBeforeMute > 0 ? volumeBeforeMute : 0.7;
}
