export const MIN_CLIP_DURATION = 10;
export const CLIP_DURATION_STEP = 5;
export const MAX_CLIP_DURATION = 30;
export const DEFAULT_CLIP_DURATION = MAX_CLIP_DURATION;

/** @deprecated Usar DEFAULT_CLIP_DURATION */
export const AUDIO_CLIP_DURATION = DEFAULT_CLIP_DURATION;

export interface AudioClipBounds {
  start: number;
  end: number;
  /** El archivo completo cabe en el clip: se puede usar loop nativo del navegador */
  nativeLoop: boolean;
}

export function isFullAudioClip(clipDuration: number): boolean {
  return clipDuration <= 0;
}

export function getEffectiveClipDuration(
  clipDuration: number,
  duration: number
): number {
  if (isFullAudioClip(clipDuration)) return 0;
  if (!Number.isFinite(duration) || duration <= 0) {
    return clipDuration > 0 ? clipDuration : 0;
  }
  if (duration <= clipDuration) return 0;
  return clipDuration;
}

export function getClipDurationOptions(duration: number): number[] {
  if (!Number.isFinite(duration) || duration <= 0) return [0];

  const options: number[] = [0];

  if (duration < MIN_CLIP_DURATION) {
    return options;
  }

  const trackMax = Math.floor(duration / CLIP_DURATION_STEP) * CLIP_DURATION_STEP;
  const maxClip = Math.min(MAX_CLIP_DURATION, trackMax);
  for (let d = MIN_CLIP_DURATION; d <= maxClip; d += CLIP_DURATION_STEP) {
    options.push(d);
  }

  return options;
}

export function normalizeClipDuration(
  clipDuration: number,
  duration: number
): number {
  if (isFullAudioClip(clipDuration)) return 0;
  if (!Number.isFinite(duration) || duration <= 0) {
    return clipDuration > 0 ? clipDuration : DEFAULT_CLIP_DURATION;
  }
  if (duration < MIN_CLIP_DURATION) return 0;

  const trackMax = Math.floor(duration / CLIP_DURATION_STEP) * CLIP_DURATION_STEP;
  const maxClip = Math.min(MAX_CLIP_DURATION, trackMax);
  if (maxClip < MIN_CLIP_DURATION) return 0;

  let rounded =
    Math.round(clipDuration / CLIP_DURATION_STEP) * CLIP_DURATION_STEP;
  if (rounded < MIN_CLIP_DURATION) rounded = MIN_CLIP_DURATION;
  if (rounded > maxClip) rounded = maxClip;

  return rounded;
}

export function getAudioClipBounds(
  duration: number,
  startTime: number,
  clipDuration: number = DEFAULT_CLIP_DURATION
): AudioClipBounds {
  if (!Number.isFinite(duration) || duration <= 0) {
    return { start: 0, end: Infinity, nativeLoop: false };
  }

  const effective = getEffectiveClipDuration(clipDuration, duration);
  if (effective <= 0) {
    return { start: 0, end: duration, nativeLoop: true };
  }

  const start = clampAudioStart(startTime, duration, effective);
  return { start, end: start + effective, nativeLoop: false };
}

export function formatAudioTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function clampAudioStart(
  startTime: number,
  duration: number,
  clipDuration: number = DEFAULT_CLIP_DURATION
): number {
  const effective = getEffectiveClipDuration(clipDuration, duration);
  if (effective <= 0) return 0;
  if (!Number.isFinite(duration) || duration <= effective) return 0;
  return Math.max(0, Math.min(startTime, duration - effective));
}
