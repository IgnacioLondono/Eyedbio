"use client";

import { Crown, CheckCircle, Star, Eye } from "lucide-react";
import { Profile } from "@/types/profile";
import { hexToRgba } from "@/lib/color-utils";
import { getMediaSrc } from "@/lib/media-url";
import {
  getAvatarGlowStyle,
  getNameEffectClass,
  getNameEffectStyle,
  resolveNameEffect,
} from "@/lib/name-effects";
import { resolveAvatarStyle } from "@/lib/card-layout-config";
import type { AvatarStyle } from "@/types/profile";

const BADGE_CONFIG: Record<string, { icon: typeof Crown; color: string; label: string }> = {
  premium: { icon: Crown, color: "#f59e0b", label: "Premium" },
  verified: { icon: CheckCircle, color: "#3b82f6", label: "Verificado" },
  og: { icon: Star, color: "#a855f7", label: "OG" },
};

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
    avatar: compact ? "w-16 h-16" : "w-24 h-24",
    name: compact ? "text-lg" : "text-2xl",
    badge: compact ? "w-4 h-4" : "w-5 h-5",
    bio: compact ? "text-xs line-clamp-3" : "text-sm max-w-xs",
    views: compact ? "text-[10px]" : "text-xs",
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
      className={`${size} overflow-hidden shrink-0 ${avatarShapeClass(avatarStyle)} ${className}`}
      style={avatarBorderStyle(avatarStyle, settings.textColor, settings.accentColor, glow)}
    >
      <img
        src={getMediaSrc(profile.avatarUrl)}
        alt={profile.displayName}
        referrerPolicy="no-referrer"
        decoding="async"
        className="w-full h-full object-cover object-center"
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
  const alignClass = align === "left" ? "justify-start text-left" : "justify-center text-center";

  return (
    <>
      <div className={`flex items-center gap-1.5 flex-wrap ${alignClass} ${scale.compact ? "px-0" : "gap-2"}`}>
        <h1
          className={`${scale.name} font-bold break-all ${nameEffectClass ?? ""}`}
          style={{
            color: nameEffect === "gradient" ? undefined : textColor,
            ...nameEffectStyle,
          }}
        >
          {profile.displayName}
        </h1>
        {profile.badges.map((badge) => {
          const config = BADGE_CONFIG[badge];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <span
              key={badge}
              title={config.label}
              className="inline-flex shrink-0"
              style={{
                filter: settings.glowIcons
                  ? `drop-shadow(0 0 6px ${config.color})`
                  : undefined,
              }}
            >
              <Icon className={scale.badge} style={{ color: config.color }} />
            </span>
          );
        })}
      </div>
      <p
        className={`${scale.compact ? "text-xs" : "text-sm"} ${nameEffect !== "none" && nameEffect !== "gradient" ? nameEffectClass ?? "" : ""}`}
        style={{
          color: hexToRgba(textColor, 0.6),
          ...(nameEffect !== "none" && nameEffect !== "gradient"
            ? getNameEffectStyle(nameEffect, settings.accentColor, hexToRgba(textColor, 0.6))
            : {}),
        }}
      >
        @{profile.username}
      </p>
    </>
  );
}

export function ProfileBio({
  profile,
  scale,
  className = "",
}: {
  profile: Profile;
  scale: CardScale;
  className?: string;
}) {
  if (!profile.bio) return null;
  return (
    <p
      className={`${scale.bio} ${className}`}
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
}: {
  profile: Profile;
  scale: CardScale;
  className?: string;
}) {
  const { textColor } = profile.settings;
  return (
    <div
      className={`flex items-center gap-1.5 ${scale.views} ${className}`}
      style={{ color: hexToRgba(textColor, 0.4) }}
    >
      <Eye className={scale.eye} />
      <span>{profile.views.toLocaleString()} visitas</span>
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
