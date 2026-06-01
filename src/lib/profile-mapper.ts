import { Prisma, SocialLink as DbSocialLink, User } from "@/generated/prisma/client";
import { resolveBackgroundType } from "@/lib/media-config";
import { resolveNameEffect } from "@/lib/name-effects";
import {
  BackgroundType,
  DEFAULT_SETTINGS,
  Profile,
  ProfileSettings,
  SocialLink,
  SocialPlatform,
} from "@/types/profile";

type UserWithLinks = User & { links: DbSocialLink[] };

function parseSettings(raw: string): Partial<ProfileSettings> {
  try {
    return JSON.parse(raw) as Partial<ProfileSettings>;
  } catch {
    return {};
  }
}

function parseBadges(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function userToProfile(user: UserWithLinks): Profile {
  const storedSettings = parseSettings(user.settings);
  const backgroundUrl =
    user.backgroundUrl ?? storedSettings.backgroundUrl ?? DEFAULT_SETTINGS.backgroundUrl;

  const settings: ProfileSettings = {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
    backgroundUrl,
    nameEffect: resolveNameEffect(storedSettings),
  };

  return {
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl:
      user.avatarUrl ??
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
    backgroundType: resolveBackgroundType(
      backgroundUrl,
      (user.backgroundType as BackgroundType) ?? "image"
    ),
    audioUrl: user.audioUrl ?? undefined,
    audioStartTime: user.audioStartTime ?? 0,
    audioEnabled: user.audioEnabled,
    views: user.views,
    badges: parseBadges(user.badges),
    links: user.links
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((link) => ({
        id: link.id,
        platform: link.platform as SocialPlatform,
        url: link.url,
        label: link.label ?? undefined,
      })),
    settings,
    createdAt: user.createdAt.toISOString(),
  };
}

export function profileToUpdateData(profile: Profile): Prisma.UserUpdateInput {
  const { backgroundUrl, ...restSettings } = profile.settings;
  const backgroundType = resolveBackgroundType(backgroundUrl, profile.backgroundType);

  return {
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    backgroundUrl,
    backgroundType,
    audioUrl: profile.audioUrl ?? null,
    audioStartTime: profile.audioStartTime,
    audioEnabled: profile.audioEnabled,
    badges: JSON.stringify(profile.badges),
    settings: JSON.stringify(restSettings),
    links: {
      deleteMany: {},
      create: profile.links.map((link, index) => ({
        platform: link.platform,
        url: link.url,
        label: link.label ?? null,
        sortOrder: index,
      })),
    },
  };
}

function createLinkId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // HTTP (no HTTPS) en red local — randomUUID no disponible
    }
  }
  return `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyLink(): SocialLink {
  return {
    id: createLinkId(),
    platform: "discord",
    url: "",
  };
}
