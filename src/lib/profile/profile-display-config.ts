import type { Profile, ProfileSettings } from "@/types/profile";

export type ResolvedProfileDisplay = {
  entryGateEnabled: boolean;
  entryGateText: string;
  browserTabTitle: string;
  showViewCount: boolean;
  showShareButton: boolean;
  location: string;
  showLocation: boolean;
  discordPresenceEnabled: boolean;
  discordUserId: string;
};

export function resolveEntryGateText(
  settings: Partial<ProfileSettings>,
  locale: "es" | "en" = "es"
): string {
  const custom = settings.entryGateText?.trim();
  if (custom) return custom;
  return locale === "en" ? "click to enter..." : "pulsa para entrar...";
}

export function resolveProfileDisplay(
  settings: Partial<ProfileSettings>,
  locale: "es" | "en" = "es"
): ResolvedProfileDisplay {
  return {
    entryGateEnabled: true,
    entryGateText: resolveEntryGateText(settings, locale),
    browserTabTitle: settings.browserTabTitle?.trim() || "",
    showViewCount: settings.showViewCount ?? true,
    showShareButton: settings.showShareButton ?? true,
    location: settings.location?.trim() || "",
    showLocation: settings.showLocation ?? false,
    discordPresenceEnabled: settings.discordPresenceEnabled ?? false,
    discordUserId: settings.discordUserId?.trim() || "",
  };
}

export function getProfileDocumentTitle(
  profile: Pick<Profile, "displayName" | "username" | "settings" | "locale">
): string {
  const { browserTabTitle } = resolveProfileDisplay(profile.settings, profile.locale);
  if (browserTabTitle) return browserTabTitle;
  return `${profile.displayName} (@${profile.username}) — Eyed.bio`;
}

export function getProfileMetadataTitle(
  profile: Pick<Profile, "displayName" | "username" | "settings" | "locale">
): string {
  const { browserTabTitle } = resolveProfileDisplay(profile.settings, profile.locale);
  if (browserTabTitle) return browserTabTitle;
  return `${profile.displayName} (@${profile.username})`;
}
