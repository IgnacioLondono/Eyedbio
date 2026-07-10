"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Profile } from "@/types/profile";
import { hexToRgba } from "@/lib/config/color-utils";
import { getMediaSrc } from "@/lib/media/media-url";
import { resolveProfileDisplay } from "@/lib/profile/profile-display-config";
import { getCardSurfaceStyle, getCardFrameStyle } from "@/lib/config/card-styles";
import { resolveLinkStyle } from "@/lib/config/card-layout-config";
import ProfileLinksDisplay from "./ProfileLinksDisplay";
import {
  getCardScale,
  ProfileAvatar,
  ProfileBio,
  ProfileFooterBrand,
  ProfileNameBlock,
  ProfileViews,
} from "./ProfileCardParts";
import ProfileExtrasSection from "./ProfileExtrasSection";
import { CardToolbarSlot } from "./ProfileCardToolbar";
import { FocusedImage } from "@/components/media/FocusedMedia";

export interface LayoutProps {
  profile: Profile;
  compact?: boolean;
}

function CardShell({
  profile,
  compact,
  children,
  className = "",
  noPadding = false,
}: {
  profile: Profile;
  compact?: boolean;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  const cardStyle = getCardSurfaceStyle(profile.settings);
  const pad = noPadding ? "" : compact ? "p-3" : "p-5";
  return (
    <div
      className={`relative w-full rounded-2xl border shadow-2xl ${pad} ${className}`}
      style={cardStyle}
    >
      {children}
      <CardToolbarSlot />
    </div>
  );
}

function LinksBlock({
  profile,
  compact,
  centered = true,
}: {
  profile: Profile;
  compact?: boolean;
  centered?: boolean;
}) {
  const { settings } = profile;
  const linkStyle = resolveLinkStyle(settings);
  const display = (
    <ProfileLinksDisplay
      links={profile.links}
      linkStyle={linkStyle}
      settings={settings}
      textColor={settings.textColor}
      username={profile.username}
      compact={compact}
      locale={profile.locale}
      mutedColor={hexToRgba(settings.textColor, 0.3)}
    />
  );

  if (!centered) return display;

  return <div className="w-full flex flex-col items-center">{display}</div>;
}

export function LayoutClassic({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  return (
    <CardShell profile={profile} compact={compact}>
      <div className="flex w-full flex-col items-center text-center">
        <ProfileAvatar profile={profile} scale={scale} className="mb-3" />
        <ProfileNameBlock profile={profile} scale={scale} />
        <ProfileBio profile={profile} scale={scale} className="mt-1.5 mb-2" />
        <ProfileExtrasSection profile={profile} scale={scale} compact={compact} className="mb-2" />
        <ProfileViews profile={profile} scale={scale} className="mb-2" />
        <LinksBlock profile={profile} compact={compact} />
      </div>
    </CardShell>
  );
}

export function LayoutHero({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  const heroAvatar = compact ? "w-20 h-20" : "w-28 h-28";
  return (
    <CardShell profile={profile} compact={compact}>
      <div className="flex w-full flex-col items-center text-center">
        <ProfileAvatar
          profile={profile}
          scale={scale}
          sizeOverride={heroAvatar}
          className="mb-4"
        />
        <ProfileNameBlock profile={profile} scale={scale} />
        <ProfileBio profile={profile} scale={scale} className="mt-2 mb-2" />
        <ProfileExtrasSection profile={profile} scale={scale} compact={compact} className="mb-2" />
        <ProfileViews profile={profile} scale={scale} className="mb-4" />
        <LinksBlock profile={profile} compact={compact} />
      </div>
    </CardShell>
  );
}

export function LayoutSplit({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  const splitAvatar = compact ? "w-14 h-14" : "w-20 h-20";
  return (
    <CardShell profile={profile} compact={compact}>
      <div className="flex gap-3 items-start text-left">
        <ProfileAvatar profile={profile} scale={scale} sizeOverride={splitAvatar} />
        <div className="min-w-0 flex-1">
          <ProfileNameBlock profile={profile} scale={scale} align="left" />
          <ProfileBio profile={profile} scale={scale} align="left" className="mt-2 mb-2" />
          <ProfileExtrasSection
            profile={profile}
            scale={scale}
            compact={compact}
            align="left"
            className="mb-2"
          />
          <ProfileViews profile={profile} scale={scale} align="left" className="mb-3" />
        </div>
      </div>
      <div className="mt-4 w-full border-t border-white/10 pt-3">
        <LinksBlock profile={profile} compact={compact} centered />
      </div>
    </CardShell>
  );
}

export function LayoutBanner({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  const { settings } = profile;
  const frameStyle = getCardFrameStyle(settings);
  const glassStyle = getCardSurfaceStyle(settings);
  const bannerH = compact ? "h-[76px]" : "h-[112px]";
  const bannerSrc = settings.bannerUrl?.trim()
    ? getMediaSrc(settings.bannerUrl)
    : null;
  const avatarSize = compact ? "w-[60px] h-[60px]" : "w-[84px] h-[84px]";
  const overlap = compact ? "-mt-[30px]" : "-mt-[42px]";

  return (
    <div
      className="relative rounded-2xl border w-full isolate"
      style={frameStyle}
    >
      {/* Capa única de vidrio/blur en toda la tarjeta — evita el corte entre banner y cuerpo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ ...glassStyle, borderRadius: "inherit" }}
        aria-hidden
      />

      <div className="relative z-10 overflow-hidden rounded-t-2xl">
        <div
          className={`${bannerH} w-full shrink-0 relative overflow-hidden`}
          style={
            bannerSrc
              ? undefined
              : {
                  background: `linear-gradient(135deg, ${settings.accentColor} 0%, ${hexToRgba(settings.cardColorSecondary || settings.accentColor, 0.9)} 55%, ${hexToRgba(settings.cardColor, 1)} 100%)`,
                }
          }
        >
          {bannerSrc ? (
            <FocusedImage
              src={bannerSrc}
              alt=""
              focus={settings.bannerFocus}
              wrapperClassName="absolute inset-0"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/50" />
          <div
            className="absolute bottom-0 inset-x-0 h-6 pointer-events-none"
            style={{
              background: settings.transparentCard
                ? "linear-gradient(to bottom, transparent, rgba(0,0,0,0.12))"
                : `linear-gradient(to bottom, transparent, ${hexToRgba(settings.cardColor, settings.profileOpacity * 0.85)})`,
            }}
            aria-hidden
          />
        </div>
      </div>

      <div className={`relative z-10 ${compact ? "px-3.5 pb-3.5" : "px-5 pb-5"}`}>
        <div className={`relative flex justify-center ${overlap} mb-1`}>
          <ProfileAvatar
            profile={profile}
            scale={scale}
            sizeOverride={avatarSize}
            className="ring-[3px] ring-[#0a0a0f]/80 shadow-lg shadow-black/40"
          />
        </div>

        <div className="flex w-full flex-col items-center text-center">
          <ProfileNameBlock profile={profile} scale={scale} />
          <ProfileBio profile={profile} scale={scale} className="mt-1.5 mb-1.5" />
          <ProfileExtrasSection profile={profile} scale={scale} compact={compact} className="mb-1.5" />
          <ProfileViews profile={profile} scale={scale} className="mb-2" />
          <LinksBlock profile={profile} compact={compact} />
        </div>
      </div>

      <CardToolbarSlot />
    </div>
  );
}

export function LayoutMinimal({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  const { settings } = profile;
  const display = resolveProfileDisplay(settings);
  const location = display.location.trim();
  const showLocation = display.showLocation && location.length > 0;
  const avatarSize = compact ? "w-14 h-14" : "w-[72px] h-[72px]";

  if (!compact) {
    return (
      <div className="relative flex w-full flex-col items-center gap-4 px-2 text-center">
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-5 sm:text-left">
          <ProfileAvatar
            profile={profile}
            scale={scale}
            sizeOverride={avatarSize}
            className="shrink-0"
          />
          <div className="min-w-0 flex flex-col items-center sm:items-start">
            <ProfileNameBlock profile={profile} scale={scale} align="center" />
          </div>
        </div>
        <ProfileBio profile={profile} scale={scale} className="max-w-sm" />
        <ProfileExtrasSection profile={profile} scale={scale} compact={compact} className="mb-1" />
        <LinksBlock profile={profile} compact={compact} />
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ProfileViews profile={profile} scale={scale} />
          {showLocation ? (
            <div
              className={`inline-flex items-center gap-1.5 ${scale.location}`}
              style={{ color: hexToRgba(settings.textColor, 0.45) }}
            >
              <MapPin className={scale.locationIcon} style={{ color: hexToRgba(settings.accentColor, 0.85) }} />
              <span>{location}</span>
            </div>
          ) : null}
        </div>
        <CardToolbarSlot />
      </div>
    );
  }

  const cardStyle = getCardSurfaceStyle(profile.settings);
  const minimalStyle = profile.settings.transparentCard
    ? { ...cardStyle, background: "transparent", border: "none", boxShadow: "none" }
    : cardStyle;

  return (
    <div
      className="relative flex w-full flex-col items-center rounded-2xl p-2 text-center"
      style={minimalStyle}
    >
      <ProfileAvatar profile={profile} scale={scale} sizeOverride={avatarSize} className="mb-2" />
      <ProfileNameBlock profile={profile} scale={scale} />
      <ProfileBio profile={profile} scale={scale} className="mt-1 mb-2" />
      <ProfileExtrasSection profile={profile} scale={scale} compact={compact} className="mb-2" />
      <ProfileViews profile={profile} scale={scale} className="mb-3" />
      <LinksBlock profile={profile} compact={compact} />
      <CardToolbarSlot />
    </div>
  );
}

function LayoutBarFooter({ profile, scale, compact }: { profile: Profile; scale: ReturnType<typeof getCardScale>; compact?: boolean }) {
  const { settings } = profile;
  const display = resolveProfileDisplay(settings);
  const location = display.location.trim();
  const showLocation = display.showLocation && location.length > 0;
  const showViews = display.showViewCount;

  if (!showViews && !showLocation) return null;

  return (
    <div
      className={`mt-2.5 flex w-full flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/10 pt-2.5 ${
        compact ? "text-[10px]" : "text-xs"
      }`}
      style={{ color: hexToRgba(settings.textColor, 0.42) }}
    >
      {showViews ? <ProfileViews profile={profile} scale={scale} align="left" className="w-auto" /> : null}
      {showViews && showLocation ? (
        <span className="hidden sm:inline text-white/20" aria-hidden>
          |
        </span>
      ) : null}
      {showLocation ? (
        <div className="inline-flex items-center gap-1.5">
          <MapPin className={scale.locationIcon} style={{ color: hexToRgba(settings.accentColor, 0.8) }} />
          <span className="truncate">{location}</span>
        </div>
      ) : null}
    </div>
  );
}

export function LayoutBar({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  const avatarSize = compact ? "w-11 h-11" : "w-14 h-14";

  return (
    <CardShell profile={profile} compact={compact}>
      <div className="flex gap-3 items-start text-left">
        <ProfileAvatar
          profile={profile}
          scale={scale}
          sizeOverride={avatarSize}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <ProfileNameBlock profile={profile} scale={scale} align="left" />
          <ProfileBio profile={profile} scale={scale} align="left" className="mt-1 mb-1.5" />
          <ProfileExtrasSection
            profile={profile}
            scale={scale}
            compact={compact}
            align="left"
            className="mb-1"
          />
        </div>
      </div>
      <div className="mt-3 border-t border-white/10 pt-3">
        <LinksBlock profile={profile} compact={compact} centered />
      </div>
      <LayoutBarFooter profile={profile} scale={scale} compact={compact} />
    </CardShell>
  );
}

export function LayoutStack({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  return (
    <CardShell profile={profile} compact={compact}>
      <div className="mb-2 flex w-full flex-col items-center text-center">
        <ProfileAvatar profile={profile} scale={scale} className="mb-2" />
        <ProfileNameBlock profile={profile} scale={scale} />
        <ProfileBio profile={profile} scale={scale} className="mt-1 mb-2" />
        <ProfileExtrasSection profile={profile} scale={scale} compact={compact} className="mb-2" />
        <ProfileViews profile={profile} scale={scale} />
      </div>
      <LinksBlock profile={profile} compact={compact} />
    </CardShell>
  );
}

export function LayoutGlass({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  return (
    <CardShell
      profile={profile}
      compact={compact}
      className={compact ? "mx-auto max-w-[260px]" : "max-w-md"}
    >
      <div className="flex w-full flex-col items-center text-center">
        <ProfileAvatar profile={profile} scale={scale} className="mb-3" />
        <ProfileNameBlock profile={profile} scale={scale} />
        <ProfileBio profile={profile} scale={scale} className="mt-2 mb-3" />
        <ProfileExtrasSection profile={profile} scale={scale} compact={compact} className="mb-3" />
      </div>
      <div
        className={`flex w-full flex-col items-center gap-3 border-t border-white/10 pt-3 ${
          compact ? "gap-2" : "gap-4"
        }`}
      >
        <ProfileViews profile={profile} scale={scale} />
        <LinksBlock profile={profile} compact={compact} />
      </div>
    </CardShell>
  );
}

export const CARD_LAYOUT_COMPONENTS = {
  classic: LayoutClassic,
  hero: LayoutHero,
  split: LayoutSplit,
  banner: LayoutBanner,
  minimal: LayoutMinimal,
  stack: LayoutStack,
  glass: LayoutGlass,
  bar: LayoutBar,
} as const;

export function ProfileCardMotionWrapper({
  profile,
  compact,
  showcase,
  children,
  maxWidth,
}: {
  profile: Profile;
  compact?: boolean;
  showcase?: boolean;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const widthClass = maxWidth ?? (compact || showcase ? "max-w-[280px]" : "max-w-md");

  if (showcase) {
    return (
      <div
        className={`relative mx-auto w-full ${widthClass} pointer-events-none select-none`}
      >
        {children}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`relative mx-auto w-full ${widthClass} flex flex-col items-center`}>
        {children}
        <ProfileFooterBrand profile={profile} compact />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative mx-auto w-full ${widthClass}`}
    >
      {children}
      <ProfileFooterBrand profile={profile} compact={false} />
    </motion.div>
  );
}
