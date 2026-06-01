import { Prisma, SocialLink as DbSocialLink, User } from "@/generated/prisma/client";
import { parseBadgesJson } from "@/lib/badges";
import { resolveBackgroundEffect } from "@/lib/background-effects-config";
import {
  resolveAvatarStyle,
  resolveCardLayout,
  resolveLinkStyle,
} from "@/lib/card-layout-config";
import { parseLocale } from "@/lib/i18n/types";
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
  return parseBadgesJson(raw);
}

export function userToProfile(user: UserWithLinks): Profile {
  const storedSettings = parseSettings(user.settings);
  const backgroundUrl =
    user.backgroundUrl ?? storedSettings.backgroundUrl ?? DEFAULT_SETTINGS.backgroundUrl;

  const merged: ProfileSettings = {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
    backgroundUrl,
    nameEffect: resolveNameEffect(storedSettings),
    cardLayout: resolveCardLayout(storedSettings),
    linkStyle: resolveLinkStyle(storedSettings),
    avatarStyle: resolveAvatarStyle(storedSettings),
    backgroundEffect: resolveBackgroundEffect(storedSettings.backgroundEffect),
    bannerUrl: storedSettings.bannerUrl ?? DEFAULT_SETTINGS.bannerUrl,
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
        iconUrl: link.iconUrl ?? undefined,
      })),
    settings: merged,
    locale: parseLocale((user as User & { locale?: string }).locale),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function profileToUserUpdateData(profile: Profile): Prisma.UserUpdateInput {
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
  };
}

/** @deprecated Usar profileToUserUpdateData + saveUserProfile para enlaces */
export function profileToUpdateData(profile: Profile): Prisma.UserUpdateInput {
  return {
    ...profileToUserUpdateData(profile),
    links: {
      deleteMany: {},
      create: profile.links.map((link, index) => ({
        platform: link.platform,
        url: link.url,
        label: link.label ?? null,
        iconUrl: link.iconUrl ?? null,
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

export function createEmptyLink(platform: SocialPlatform = "discord"): SocialLink {
  return {
    id: createLinkId(),
    platform,
    url: "",
  };
}
