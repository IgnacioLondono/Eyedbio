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

let boundVideo: HTMLVideoElement | null = null;
let audioFromVideo = false;
let volume = 0.7;
let volumeInitialized = false;
let volumeBeforeMute = 0.7;
let listeners = new Set<Listener>();
let pendingPlay: PendingPlay | null = null;
let audioUnlocked = false;

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
  return Boolean(boundVideo && !boundVideo.paused && !boundVideo.ended);
}

function refreshSnapshot(): BackgroundVideoAudioSnapshot {
  ensureVolumeInitialized();
  const element = boundVideo;
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

function syncElementVolume(element: HTMLVideoElement, withAudio: boolean): void {
  ensureVolumeInitialized();
  if (withAudio && audioFromVideo) {
    audioUnlocked = true;
    if (volume > 0) {
      element.volume = volume;
      element.muted = false;
    } else {
      element.muted = true;
      element.volume = 0;
    }
    markMediaUnlockedSession();
    return;
  }

  element.muted = true;
  element.volume = 0;
}

async function startPlayback(element: HTMLVideoElement, withAudio: boolean): Promise<void> {
  element.currentTime = 0;
  syncElementVolume(element, withAudio);

  try {
    await element.play();
    notify();
    return;
  } catch {
    element.muted = true;
    element.volume = 0;
  }

  try {
    await element.play();
  } catch {
    /* el navegador bloqueó la reproducción */
  }
  notify();
}

export function resetBackgroundVideoAudioState(): void {
  pendingPlay = null;
  audioUnlocked = false;
  audioFromVideo = false;
  boundVideo = null;
  notify();
}

export function bindProfileBackgroundVideo(
  element: HTMLVideoElement | null,
  options?: { audioFromVideo?: boolean }
): () => void {
  if (options) {
    audioFromVideo = options.audioFromVideo ?? false;
  }

  if (!element) {
    boundVideo = null;
    notify();
    return () => {};
  }

  boundVideo = element;
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
    if (boundVideo === element) {
      boundVideo = null;
    }
    notify();
  };
}

export function holdProfileBackgroundVideo(): void {
  const element = boundVideo;
  if (!element) return;
  element.pause();
  element.currentTime = 0;
  element.muted = true;
  element.volume = 0;
  notify();
}

export function playProfileBackgroundVideo(options: { withAudio: boolean }): void {
  const element = boundVideo;
  if (!element) {
    pendingPlay = options;
    return;
  }

  pendingPlay = null;
  void startPlayback(element, options.withAudio);
}

export function isProfileBackgroundVideoActive(): boolean {
  return boundVideo !== null;
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

/** Compat: arranca el video de fondo con sonido (gesto de entrada). */
export function startBackgroundVideoFromEnter(): boolean {
  playProfileBackgroundVideo({ withAudio: true });
  return Boolean(boundVideo);
}

/** Compat: arranca video de fondo en bucle sin audio (gesto de entrada). */
export function startBackgroundVideoMutedFromEnter(): boolean {
  playProfileBackgroundVideo({ withAudio: false });
  return Boolean(boundVideo);
}

export function unmuteBackgroundVideoFromUserGesture(): boolean {
  const element = boundVideo;
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
  const element = boundVideo;
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

  const element = boundVideo;
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
