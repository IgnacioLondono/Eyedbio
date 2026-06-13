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

export function resolveProfileDisplay(
  settings: Partial<ProfileSettings>
): ResolvedProfileDisplay {
  return {
    entryGateEnabled: settings.entryGateEnabled ?? true,
    entryGateText: settings.entryGateText?.trim() || "click to enter...",
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
  profile: Pick<Profile, "displayName" | "username" | "settings">
): string {
  const { browserTabTitle } = resolveProfileDisplay(profile.settings);
  if (browserTabTitle) return browserTabTitle;
  return `${profile.displayName} (@${profile.username}) — Eyed.bio`;
}

export function getProfileMetadataTitle(
  profile: Pick<Profile, "displayName" | "username" | "settings">
): string {
  const { browserTabTitle } = resolveProfileDisplay(profile.settings);
  if (browserTabTitle) return browserTabTitle;
  return `${profile.displayName} (@${profile.username})`;
}
