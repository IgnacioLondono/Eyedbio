export const AUDIO_CLIP_DURATION = 30;

export interface AudioClipBounds {
  start: number;
  end: number;
  /** El archivo completo cabe en el clip: se puede usar loop nativo del navegador */
  nativeLoop: boolean;
}

export function getAudioClipBounds(
  duration: number,
  startTime: number
): AudioClipBounds {
  if (!Number.isFinite(duration) || duration <= 0) {
    return { start: 0, end: Infinity, nativeLoop: false };
  }

  if (duration <= AUDIO_CLIP_DURATION) {
    return { start: 0, end: duration, nativeLoop: true };
  }

  const start = clampAudioStart(startTime, duration);
  return { start, end: start + AUDIO_CLIP_DURATION, nativeLoop: false };
}

export function formatAudioTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function clampAudioStart(startTime: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= AUDIO_CLIP_DURATION) return 0;
  return Math.max(0, Math.min(startTime, duration - AUDIO_CLIP_DURATION));
}
