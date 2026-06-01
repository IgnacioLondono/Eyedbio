export const AUDIO_CLIP_DURATION = 30;

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
