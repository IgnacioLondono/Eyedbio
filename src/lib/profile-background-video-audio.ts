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
let volume = 0.7;
let volumeInitialized = false;
let volumeBeforeMute = 0.7;
let listeners = new Set<Listener>();

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
  const needsTap = Boolean(element && volume > 0 && muted && playing);

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

function applyVolumeToVideo(): void {
  const element = video;
  if (!element) return;

  if (volume === 0) {
    element.muted = true;
    element.volume = 0;
    return;
  }

  element.volume = volume;
}

export function registerProfileBackgroundVideo(element: HTMLVideoElement): () => void {
  video = element;
  ensureVolumeInitialized();
  applyVolumeToVideo();

  const sync = () => notify();
  element.addEventListener("play", sync);
  element.addEventListener("pause", sync);
  element.addEventListener("volumechange", sync);

  if (element.paused) {
    void element.play().catch(() => notify());
  }

  notify();

  return () => {
    element.removeEventListener("play", sync);
    element.removeEventListener("pause", sync);
    element.removeEventListener("volumechange", sync);
    if (video === element) {
      video = null;
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

/** Desbloquea el sonido del video de fondo sin reiniciar la reproducción. */
export function unmuteBackgroundVideoFromUserGesture(): boolean {
  const element = video;
  if (!element || volume === 0) return false;

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
  if (!element || volume === 0 || !element.muted) return;
  unmuteBackgroundVideoFromUserGesture();
}

export function setBackgroundVideoVolume(nextVolume: number): void {
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
