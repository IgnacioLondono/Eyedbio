import { markMediaUnlockedSession } from "@/lib/media-gesture";

const VOLUME_STORAGE_KEY = "eyed-audio-volume";

export type BackgroundVideoAudioSnapshot = {
  volume: number;
  muted: boolean;
  isPlaying: boolean;
  needsTap: boolean;
};

type Listener = () => void;
type PendingPlay = { withAudio: boolean };

let activeVideo: HTMLVideoElement | null = null;
let audioFromVideo = false;
let volume = 0.7;
let volumeInitialized = false;
let volumeBeforeMute = 0.7;
let listeners = new Set<Listener>();
let pendingPlay: PendingPlay | null = null;

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
  return Boolean(activeVideo && !activeVideo.paused && !activeVideo.ended);
}

function refreshSnapshot(): BackgroundVideoAudioSnapshot {
  ensureVolumeInitialized();
  const element = activeVideo;
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

function holdElement(element: HTMLVideoElement): void {
  element.pause();
  if (element.readyState >= HTMLMediaElement.HAVE_METADATA) {
    element.currentTime = 0;
  }
  element.muted = true;
  element.volume = 0;
}

function applyMutedLoop(element: HTMLVideoElement): void {
  element.muted = true;
  element.volume = 0;
}

function applyVideoAudioVolume(element: HTMLVideoElement): void {
  ensureVolumeInitialized();
  if (volume > 0) {
    element.volume = volume;
    element.muted = false;
    markMediaUnlockedSession();
    return;
  }
  element.muted = true;
  element.volume = 0;
}

function whenReady(element: HTMLVideoElement): Promise<void> {
  if (element.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const done = () => {
      element.removeEventListener("canplay", done);
      element.removeEventListener("loadeddata", done);
      resolve();
    };
    element.addEventListener("canplay", done);
    element.addEventListener("loadeddata", done);
    if (element.readyState === HTMLMediaElement.HAVE_NOTHING) {
      element.load();
    }
  });
}

async function startPlayback(element: HTMLVideoElement, withAudio: boolean): Promise<void> {
  const wantsAudio = withAudio && audioFromVideo;

  try {
    await whenReady(element);

    if (element.readyState >= HTMLMediaElement.HAVE_METADATA) {
      element.currentTime = 0;
    }

    element.muted = true;
    element.volume = 0;
    await element.play();

    if (wantsAudio) {
      applyVideoAudioVolume(element);
    } else {
      applyMutedLoop(element);
    }
  } catch {
    try {
      element.muted = true;
      element.volume = 0;
      await element.play();
    } catch {
      /* autoplay bloqueado */
    }
  }

  notify();
}

export function resetBackgroundVideoAudioState(): void {
  pendingPlay = null;
  audioFromVideo = false;
  activeVideo = null;
  notify();
}

export function setActiveBackgroundVideo(
  element: HTMLVideoElement | null,
  options?: { audioFromVideo?: boolean }
): () => void {
  if (options) {
    audioFromVideo = options.audioFromVideo ?? false;
  }

  if (!element) {
    if (activeVideo) {
      activeVideo = null;
      notify();
    }
    return () => {};
  }

  activeVideo = element;
  ensureVolumeInitialized();

  const sync = () => notify();
  element.addEventListener("play", sync);
  element.addEventListener("pause", sync);
  element.addEventListener("volumechange", sync);
  element.addEventListener("timeupdate", sync);

  if (pendingPlay) {
    const opts = pendingPlay;
    pendingPlay = null;
    void startPlayback(element, opts.withAudio);
  }

  notify();

  return () => {
    element.removeEventListener("play", sync);
    element.removeEventListener("pause", sync);
    element.removeEventListener("volumechange", sync);
    element.removeEventListener("timeupdate", sync);
    if (activeVideo === element) {
      activeVideo = null;
    }
    notify();
  };
}

export function holdProfileBackgroundVideo(element?: HTMLVideoElement | null): void {
  const target = element ?? activeVideo;
  if (!target) return;
  holdElement(target);
  notify();
}

export function playProfileBackgroundVideo(
  options: { withAudio: boolean },
  element?: HTMLVideoElement | null
): void {
  const target = element ?? activeVideo;
  if (!target) {
    pendingPlay = options;
    return;
  }

  pendingPlay = null;
  void startPlayback(target, options.withAudio);
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

export function unmuteBackgroundVideoFromUserGesture(): boolean {
  const element = activeVideo;
  if (!element || !audioFromVideo || volume === 0) return false;

  applyVideoAudioVolume(element);

  if (element.paused) {
    void element.play().catch(() => notify());
  }

  notify();
  return true;
}

export function unmuteBackgroundVideoIfNeeded(): void {
  const element = activeVideo;
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

  const element = activeVideo;
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

/** @deprecated use setActiveBackgroundVideo */
export function bindProfileBackgroundVideo(
  element: HTMLVideoElement | null,
  options?: { audioFromVideo?: boolean }
): () => void {
  return setActiveBackgroundVideo(element, options);
}
