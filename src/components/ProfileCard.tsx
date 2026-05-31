"use client";

import { motion } from "framer-motion";
import { Eye, Crown, CheckCircle, Star } from "lucide-react";
import { Profile } from "@/types/profile";
import { hexToRgba } from "@/lib/color-utils";
import { getMediaSrc } from "@/lib/media-url";
import SocialLinks from "./SocialLinks";

const BADGE_CONFIG: Record<string, { icon: typeof Crown; color: string; label: string }> = {
  premium: { icon: Crown, color: "#f59e0b", label: "Premium" },
  verified: { icon: CheckCircle, color: "#3b82f6", label: "Verificado" },
  og: { icon: Star, color: "#a855f7", label: "OG" },
};

interface Props {
  profile: Profile;
  compact?: boolean;
}

export default function ProfileCard({ profile, compact = false }: Props) {
  const { settings } = profile;
  const { cardColor, cardColorSecondary, textColor, profileOpacity } = settings;

  const cardStyle: React.CSSProperties = {
    background: settings.gradientEnabled
      ? `linear-gradient(135deg, ${hexToRgba(cardColor, profileOpacity)} 0%, ${hexToRgba(cardColorSecondary, profileOpacity)} 100%)`
      : hexToRgba(cardColor, profileOpacity),
    backdropFilter: `blur(${settings.profileBlur}px)`,
    WebkitBackdropFilter: `blur(${settings.profileBlur}px)`,
    borderColor: `${settings.accentColor}33`,
  };

  const avatarSize = compact ? "w-16 h-16" : "w-24 h-24";
  const nameSize = compact ? "text-lg" : "text-2xl";
  const cardPadding = compact ? "p-4" : "p-8";
  const badgeSize = compact ? "w-4 h-4" : "w-5 h-5";

  const Wrapper = compact ? "div" : motion.div;
  const wrapperProps = compact
    ? { className: "relative w-full max-w-[260px] mx-auto" }
    : {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" },
        className: "relative w-full max-w-md mx-auto",
      };

  const AvatarWrapper = compact ? "div" : motion.div;
  const avatarWrapperProps = compact
    ? { className: "relative mb-3" }
    : {
        initial: { scale: 0.8 },
        animate: { scale: 1 },
        transition: { delay: 0.2, type: "spring", stiffness: 200 },
        className: "relative mb-4",
      };

  return (
    <Wrapper {...(wrapperProps as object)}>
      <div className={`rounded-2xl border shadow-2xl ${cardPadding}`} style={cardStyle}>
        <div className="flex flex-col items-center text-center">
          <AvatarWrapper {...(avatarWrapperProps as object)}>
            <div
              className={`${avatarSize} rounded-full overflow-hidden mx-auto`}
              style={{
                border: `2px solid ${hexToRgba(textColor, 0.2)}`,
                boxShadow: settings.glowUsername
                  ? `0 0 30px ${settings.accentColor}66`
                  : undefined,
              }}
            >
              <img
                src={getMediaSrc(profile.avatarUrl)}
                alt={profile.displayName}
                referrerPolicy="no-referrer"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </AvatarWrapper>

          <div className={`flex items-center justify-center gap-1.5 mb-0.5 flex-wrap ${compact ? "px-1" : "gap-2 mb-1"}`}>
            <h1
              className={`${nameSize} font-bold break-all`}
              style={{
                color: textColor,
                textShadow: settings.glowUsername
                  ? `0 0 20px ${settings.accentColor}`
                  : undefined,
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
                  <Icon className={badgeSize} style={{ color: config.color }} />
                </span>
              );
            })}
          </div>

          <p className={`mb-1 ${compact ? "text-xs" : "text-sm"}`} style={{ color: hexToRgba(textColor, 0.6) }}>
            @{profile.username}
          </p>

          {profile.bio && (
            <p
              className={`max-w-full ${
                compact ? "text-xs line-clamp-3 mb-3" : "text-sm mb-4 max-w-xs"
              }`}
              style={{ color: hexToRgba(textColor, 0.8) }}
            >
              {profile.bio}
            </p>
          )}

          <div
            className={`flex items-center justify-center gap-1.5 ${
              compact ? "text-[10px] mb-3" : "text-xs mb-6"
            }`}
            style={{ color: hexToRgba(textColor, 0.4) }}
          >
            <Eye className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
            <span>{profile.views.toLocaleString()} visitas</span>
          </div>

          <SocialLinks
            links={profile.links}
            accentColor={settings.accentColor}
            glowIcons={settings.glowIcons}
            monochromeIcons={settings.monochromeIcons}
            compact={compact}
            mutedColor={hexToRgba(textColor, 0.3)}
          />
        </div>
      </div>

      {!compact && (
        <p className="text-center text-xs mt-6" style={{ color: hexToRgba(textColor, 0.2) }}>
          eyed.bio/{profile.username}
        </p>
      )}
    </Wrapper>
  );
}
