import { Prisma, SocialLink as DbSocialLink, User } from "@/generated/prisma/client";
import { parseBadgesJson } from "@/lib/config/badges";
import { DEFAULT_CLIP_DURATION } from "@/lib/config/audio-config";
import { resolveBackgroundEffect } from "@/lib/config/background-effects-config";
import {
  resolveBackgroundDim,
  resolvePageOverlay,
} from "@/lib/profile/profile-overlay-config";
import {
  resolveAvatarStyle,
  resolveCardLayout,
  resolveLinkStyle,
} from "@/lib/config/card-layout-config";
import {
  resolveIconColorMode,
  resolveIconShape,
  resolveProfileNameIconShape,
} from "@/lib/config/icon-style-config";
import { parseLocale } from "@/lib/i18n/types";
import { parseMediaFocus } from "@/lib/media/media-focus";
import { resolveBackgroundType } from "@/lib/media/media-config";
import { resolveAudioSource } from "@/lib/profile/profile-audio";
import { resolveNameEffect } from "@/lib/name-effects";
import {
  BackgroundType,
  DEFAULT_SETTINGS,
  Profile,
  ProfileSettings,
  SocialLink,
  SocialPlatform,
  type AudioSource,
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

function readStoredNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return fallback;
}

function resolveProfileAudioStartTime(
  user: UserWithLinks,
  storedSettings: Partial<ProfileSettings>
): number {
  const fromColumn = user.audioStartTime;
  if (typeof fromColumn === "number" && !Number.isNaN(fromColumn)) return fromColumn;
  return readStoredNumber(storedSettings.audioStartTime, 0);
}

function resolveProfileAudioClipDuration(
  user: UserWithLinks,
  storedSettings: Partial<ProfileSettings>
): number {
  const fromColumn = user.audioClipDuration;
  if (typeof fromColumn === "number" && !Number.isNaN(fromColumn)) return fromColumn;
  return readStoredNumber(storedSettings.audioClipDuration, DEFAULT_CLIP_DURATION);
}

/** Si el audio sale del fondo, el medio tiene que ser video aunque la BD diga image. */
function resolveProfileBackgroundType(
  backgroundUrl: string,
  storedType: BackgroundType,
  audioSource: AudioSource
): BackgroundType {
  const resolved = resolveBackgroundType(backgroundUrl, storedType);
  if (resolved === "video") return "video";
  if (audioSource === "background" && backgroundUrl.trim()) return "video";
  return resolved;
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
    iconColorMode: resolveIconColorMode(storedSettings),
    iconShape: resolveIconShape(storedSettings),
    profileNameIconShape: resolveProfileNameIconShape(storedSettings),
    backgroundEffect: resolveBackgroundEffect(storedSettings.backgroundEffect),
    backgroundDim: resolveBackgroundDim(storedSettings),
    pageOverlay: resolvePageOverlay(storedSettings),
    bannerUrl: storedSettings.bannerUrl ?? DEFAULT_SETTINGS.bannerUrl,
    avatarFocus: parseMediaFocus(storedSettings.avatarFocus),
    bannerFocus: parseMediaFocus(storedSettings.bannerFocus),
    backgroundFocus: parseMediaFocus(storedSettings.backgroundFocus),
  };

  const storedBackgroundType = (user.backgroundType as BackgroundType) ?? "image";
  const resolvedAudioSource = resolveAudioSource(
    (user as User & { audioSource?: string }).audioSource as AudioSource | undefined,
    {
      settings: { ...merged, backgroundUrl },
      backgroundType: storedBackgroundType,
    }
  );
  const backgroundType = resolveProfileBackgroundType(
    backgroundUrl,
    storedBackgroundType,
    resolvedAudioSource
  );

  return {
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl:
      user.avatarUrl ??
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
    backgroundType,
    audioUrl: user.audioUrl ?? undefined,
    audioStartTime: resolveProfileAudioStartTime(user, storedSettings),
    audioClipDuration: resolveProfileAudioClipDuration(user, storedSettings),
    audioEnabled: user.audioEnabled,
    audioSource: resolveAudioSource(
      (user as User & { audioSource?: string }).audioSource as AudioSource | undefined,
      {
        settings: merged,
        backgroundType,
      }
    ),
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
  const audioStartTime =
    typeof profile.audioStartTime === "number" && !Number.isNaN(profile.audioStartTime)
      ? Math.max(0, profile.audioStartTime)
      : 0;
  const audioClipDuration =
    typeof profile.audioClipDuration === "number" && !Number.isNaN(profile.audioClipDuration)
      ? profile.audioClipDuration
      : DEFAULT_CLIP_DURATION;

  return {
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    backgroundUrl,
    backgroundType,
    audioUrl: profile.audioUrl ?? null,
    audioStartTime,
    audioClipDuration,
    audioEnabled: profile.audioEnabled,
    audioSource: resolveAudioSource(profile.audioSource, profile),
    badges: JSON.stringify(profile.badges),
    settings: JSON.stringify({
      ...restSettings,
      audioStartTime,
      audioClipDuration,
    }),
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
