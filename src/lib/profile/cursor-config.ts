import type { CursorTrailEffect, ProfileSettings } from "@/types/profile";

export const CURSOR_TRAIL_EFFECTS: CursorTrailEffect[] = [
  "dots",
  "line",
  "glow",
  "sparkle",
];

export function resolveCursorTrailEffect(
  value: CursorTrailEffect | string | undefined
): CursorTrailEffect {
  if (value && (CURSOR_TRAIL_EFFECTS as string[]).includes(value)) {
    return value as CursorTrailEffect;
  }
  return "glow";
}

export function resolveCursorTrailColor(settings: ProfileSettings): string {
  const color = settings.cursorTrailColor?.trim();
  if (color) return color;
  return settings.accentColor?.trim() || "#a855f7";
}

export function hasCustomCursor(settings: ProfileSettings): boolean {
  return Boolean(settings.cursorUrl?.trim());
}

export function hasCursorTrail(settings: ProfileSettings): boolean {
  return Boolean(settings.cursorTrailEnabled);
}

/** True si hay algo que renderizar (cursor personalizado o estela). */
export function hasCursorPresentation(settings: ProfileSettings): boolean {
  return hasCustomCursor(settings) || hasCursorTrail(settings);
}
