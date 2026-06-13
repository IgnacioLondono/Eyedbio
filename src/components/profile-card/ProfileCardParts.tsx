"use client";

import { Eye } from "lucide-react";
import { Profile } from "@/types/profile";
import { hexToRgba } from "@/lib/color-utils";
import { getMediaSrc } from "@/lib/media-url";
import { FocusedImage } from "@/components/FocusedMedia";
import {
  getAvatarGlowStyle,
  getNameEffectClass,
  getNameEffectStyle,
  resolveNameEffect,
} from "@/lib/name-effects";
import { resolveAvatarStyle } from "@/lib/card-layout-config";
import { BADGE_CONFIG } from "@/lib/badges";
import { t as translate } from "@/lib/i18n";
import type { AvatarStyle } from "@/types/profile";
import type { LucideIcon } from "lucide-react";

const BADGE_PILL_STYLES: Record<string, string> = {
  owner:
    "bg-gradient-to-br from-amber-400/25 via-yellow-500/15 to-orange-600/20 border-amber-400/35 text-amber-100",
  verified:
    "bg-gradient-to-br from-blue-500/25 via-sky-500/15 to-cyan-500/20 border-blue-400/35 text-blue-100",
  premium:
    "bg-gradient-to-br from-orange-500/25 via-amber-500/15 to-yellow-500/20 border-orange-400/35 text-orange-100",
  og: "bg-gradient-to-br from-purple-500/25 via-violet-500/15 to-fuchsia-500/20 border-purple-400/35 text-purple-100",
};

function ProfileBadge({
  badge,
  icon: Icon,
  color,
  label,
  compact,
  glowIcons,
}: {
  badge: string;
  icon: LucideIcon;
  color: string;
  label: string;
  compact: boolean;
  glowIcons?: boolean;
}) {
  const pillClass = BADGE_PILL_STYLES[badge] ?? "bg-white/10 border-white/20 text-white/85";
  const size = compact ? "h-[18px] w-[18px]" : "h-5 w-5";
  const iconSize = compact ? "w-2.5 h-2.5" : "w-3 h-3";

  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border ${size} ${pillClass}`}
      style={
        glowIcons
          ? { boxShadow: `0 0 10px ${hexToRgba(color, 0.45)}` }
          : undefined
      }
    >
      <Icon className={iconSize} strokeWidth={2.25} />
    </span>
  );
}

function avatarShapeClass(style: AvatarStyle): string {
  switch (style) {
    case "rounded":
      return "rounded-2xl";
    case "ring":
    case "circle":
    default:
      return "rounded-full";
  }
}

function avatarBorderStyle(
  style: AvatarStyle,
  textColor: string,
  accentColor: string,
  glow: React.CSSProperties
): React.CSSProperties {
  if (style === "ring") {
    return {
      border: `3px solid ${accentColor}`,
      boxShadow: `0 0 20px ${hexToRgba(accentColor, 0.5)}, inset 0 0 0 1px ${hexToRgba(textColor, 0.1)}`,
      ...glow,
    };
  }
  return {
    border: `2px solid ${hexToRgba(textColor, 0.2)}`,
    ...glow,
  };
}

export interface CardScale {
  compact: boolean;
  avatar: string;
  name: string;
  badge: string;
  bio: string;
  views: string;
  eye: string;
}

export function getCardScale(compact: boolean): CardScale {
  return {
    compact,
    avatar: compact ? "w-16 h-16" : "w-20 h-20",
    name: compact ? "text-lg" : "text-xl",
    badge: compact ? "w-4 h-4" : "w-5 h-5",
    bio: compact ? "text-xs line-clamp-3" : "text-sm max-w-xs line-clamp-4",
    views: compact ? "text-[10px]" : "text-[11px]",
    eye: compact ? "w-3 h-3" : "w-3.5 h-3.5",
  };
}

export function ProfileAvatar({
  profile,
  scale,
  className = "",
  sizeOverride,
}: {
  profile: Profile;
  scale: CardScale;
  className?: string;
  sizeOverride?: string;
}) {
  const { settings } = profile;
  const avatarStyle = resolveAvatarStyle(settings);
  const nameEffect = resolveNameEffect(settings);
  const glow = getAvatarGlowStyle(nameEffect, settings.accentColor) ?? {};
  const size = sizeOverride ?? scale.avatar;

  return (
    <div
      className={`${size} shrink-0 ${avatarShapeClass(avatarStyle)} ${className}`}
      style={avatarBorderStyle(avatarStyle, settings.textColor, settings.accentColor, glow)}
    >
      <FocusedImage
        src={getMediaSrc(profile.avatarUrl)}
        alt={profile.displayName}
        focus={settings.avatarFocus}
        wrapperClassName={`h-full w-full ${avatarShapeClass(avatarStyle)}`}
      />
    </div>
  );
}

export function ProfileNameBlock({
  profile,
  scale,
  align = "center",
}: {
  profile: Profile;
  scale: CardScale;
  align?: "center" | "left";
}) {
  const { settings } = profile;
  const { textColor } = settings;
  const nameEffect = resolveNameEffect(settings);
  const nameEffectClass = getNameEffectClass(nameEffect);
  const nameEffectStyle = getNameEffectStyle(nameEffect, settings.accentColor, textColor);
  const centered = align === "center";
  const rowAlign = centered ? "justify-center" : "justify-start";
  const textAlign = centered ? "text-center" : "text-left";

  return (
    <div className={`w-full ${textAlign}`}>
      <h1
        className={`${scale.name} font-bold break-words ${textAlign} ${nameEffectClass ?? ""}`}
        style={{
          color: nameEffect === "gradient" ? undefined : textColor,
          ...nameEffectStyle,
        }}
      >
        {profile.displayName}
      </h1>
      {profile.badges.length > 0 ? (
        <div
          className={`mt-1.5 flex flex-wrap items-center gap-1.5 ${rowAlign} ${scale.compact ? "" : "gap-2"}`}
        >
          {profile.badges.map((badge) => {
            const config = BADGE_CONFIG[badge];
            if (!config) return null;
            const label = translate(profile.locale, `badges.${config.labelKey}`);
            return (
              <ProfileBadge
                key={badge}
                badge={badge}
                icon={config.icon}
                color={config.color}
                label={label}
                compact={scale.compact}
                glowIcons={settings.glowIcons}
              />
            );
          })}
        </div>
      ) : null}
      <p
        className={`mt-1 w-full ${scale.compact ? "text-xs" : "text-sm"} ${textAlign} ${
          nameEffect !== "none" && nameEffect !== "gradient" ? nameEffectClass ?? "" : ""
        }`}
        style={{
          color: hexToRgba(textColor, 0.6),
          ...(nameEffect !== "none" && nameEffect !== "gradient"
            ? getNameEffectStyle(nameEffect, settings.accentColor, hexToRgba(textColor, 0.6))
            : {})
        }}
      >
        @{profile.username}
      </p>
    </div>
  );
}

export function ProfileBio({
  profile,
  scale,
  className = "",
  align = "center",
}: {
  profile: Profile;
  scale: CardScale;
  className?: string;
  align?: "center" | "left";
}) {
  if (!profile.bio) return null;
  const alignClass = align === "left" ? "text-left mx-0" : "text-center mx-auto";
  return (
    <p
      className={`${scale.bio} w-full ${alignClass} ${className}`}
      style={{ color: hexToRgba(profile.settings.textColor, 0.8) }}
    >
      {profile.bio}
    </p>
  );
}

export function ProfileViews({
  profile,
  scale,
  className = "",
  align = "center",
}: {
  profile: Profile;
  scale: CardScale;
  className?: string;
  align?: "center" | "left";
}) {
  const { textColor } = profile.settings;
  const alignClass = align === "left" ? "justify-start" : "justify-center";
  return (
    <div
      className={`flex w-full items-center gap-1.5 ${scale.views} ${alignClass} ${className}`}
      style={{ color: hexToRgba(textColor, 0.4) }}
    >
      <Eye className={scale.eye} />
      <span>
        {profile.views.toLocaleString(profile.locale === "en" ? "en-US" : "es-ES")}{" "}
        {translate(profile.locale, "profile.visits")}
      </span>
    </div>
  );
}

export function ProfileFooterBrand({
  profile,
  compact,
}: {
  profile: Profile;
  compact?: boolean;
}) {
  if (compact) return null;
  return (
    <p
      className="text-center text-xs mt-6"
      style={{ color: hexToRgba(profile.settings.textColor, 0.2) }}
    >
      eyed.bio/{profile.username}
    </p>
  );
}
