import type { ProfileSettings } from "@/types/profile";
import { DEFAULT_SETTINGS } from "@/types/profile";
import { resolveCardLayout } from "@/lib/config/card-layout-config";

/** Keys that belong to visual style packs (safe to share / apply). */
const STYLE_KEYS: (keyof ProfileSettings)[] = [
  "backgroundEffect",
  "backgroundDim",
  "pageOverlay",
  "accentColor",
  "cardColor",
  "cardColorSecondary",
  "textColor",
  "profileOpacity",
  "profileBlur",
  "nameEffect",
  "nameAnimation",
  "glowIcons",
  "gradientEnabled",
  "monochromeIcons",
  "iconColorMode",
  "iconColor",
  "customLinkIconColor",
  "iconBackgroundColor",
  "iconShape",
  "profileNameIconShape",
  "profileNameIconRingColor",
  "transparentCard",
  "showCardBorder",
  "showCardShadow",
  "borderOpacity",
  "cursorTrailEnabled",
  "cursorTrailEffect",
  "cursorTrailColor",
  "cardLayout",
  "linkStyle",
  "avatarStyle",
  "entryGateEnabled",
  "entryGateText",
  "showViewCount",
  "showShareButton",
  "musicPlayerEnabled",
  "musicPlayerColor",
  "musicPlayerTextColor",
  "musicPlayerBlur",
];

/** Do not copy personal media / identity from a template onto another user. */
const EXCLUDED_ON_APPLY = new Set<string>([
  "backgroundUrl",
  "bannerUrl",
  "cursorUrl",
  "browserTabIconUrl",
  "profileNameIconUrl",
  "musicPlayerCoverUrl",
  "musicPlayerTitle",
  "musicPlayerArtist",
  "discordUserId",
  "location",
  "linkHidden",
  "avatarFocus",
  "bannerFocus",
  "backgroundFocus",
  "audioStartTime",
  "audioClipDuration",
  "browserTabTitle",
]);

export function snapshotTemplateSettings(
  settings: Partial<ProfileSettings>
): Partial<ProfileSettings> {
  const out: Partial<ProfileSettings> = {};
  for (const key of STYLE_KEYS) {
    const value = settings[key];
    if (value !== undefined) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  out.cardLayout = resolveCardLayout(settings);
  return out;
}

export function parseTemplateSettingsJson(raw: string): Partial<ProfileSettings> {
  try {
    const parsed = JSON.parse(raw) as Partial<ProfileSettings>;
    if (!parsed || typeof parsed !== "object") return {};
    return snapshotTemplateSettings(parsed);
  } catch {
    return {};
  }
}

export function applyTemplateSettings(
  current: ProfileSettings,
  pack: Partial<ProfileSettings>
): ProfileSettings {
  const next: ProfileSettings = { ...current };
  const safe = snapshotTemplateSettings(pack);
  for (const [key, value] of Object.entries(safe) as [keyof ProfileSettings, ProfileSettings[keyof ProfileSettings]][]) {
    if (EXCLUDED_ON_APPLY.has(key as string)) continue;
    if (value === undefined) continue;
    (next as unknown as Record<string, unknown>)[key as string] = value;
  }
  next.cardLayout = resolveCardLayout(next);
  return next;
}

export function slugifyTemplateTitle(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "plantilla";
}

export function withUniqueSlug(base: string, suffix?: string): string {
  const clean = slugifyTemplateTitle(base);
  if (!suffix) return clean;
  return `${clean}-${suffix}`.slice(0, 64);
}

export function defaultTemplatePreviewSettings(): ProfileSettings {
  return { ...DEFAULT_SETTINGS };
}
