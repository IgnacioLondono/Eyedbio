import type { ProfileSettings } from "@/types/profile";

export type PageOverlay = "none" | "scanlines" | "grain" | "vignette" | "crt";

export const PAGE_OVERLAY_OPTIONS: {
  value: PageOverlay;
  labelKey:
    | "dashboard.pageOverlayNone"
    | "dashboard.pageOverlayScanlines"
    | "dashboard.pageOverlayGrain"
    | "dashboard.pageOverlayVignette"
    | "dashboard.pageOverlayCrt";
}[] = [
  { value: "none", labelKey: "dashboard.pageOverlayNone" },
  { value: "scanlines", labelKey: "dashboard.pageOverlayScanlines" },
  { value: "grain", labelKey: "dashboard.pageOverlayGrain" },
  { value: "vignette", labelKey: "dashboard.pageOverlayVignette" },
  { value: "crt", labelKey: "dashboard.pageOverlayCrt" },
];

const VALID_OVERLAYS = new Set<PageOverlay>(PAGE_OVERLAY_OPTIONS.map((o) => o.value));

export function resolvePageOverlay(settings: Partial<ProfileSettings>): PageOverlay {
  const value = settings.pageOverlay;
  if (value && VALID_OVERLAYS.has(value)) return value;
  return "none";
}

/** Oscurecimiento del fondo (0 = sin overlay, 0.5 = default anterior). */
export function resolveBackgroundDim(settings: Partial<ProfileSettings>): number {
  const raw = settings.backgroundDim;
  if (typeof raw !== "number" || Number.isNaN(raw)) return 0.5;
  return Math.min(1, Math.max(0, raw));
}
