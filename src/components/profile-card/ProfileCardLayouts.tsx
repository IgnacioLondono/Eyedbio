"use client";

import { motion } from "framer-motion";
import { Profile } from "@/types/profile";
import { hexToRgba } from "@/lib/color-utils";
import { getMediaSrc } from "@/lib/media-url";
import { getCardSurfaceStyle, getCardFrameStyle, getCardBodySurfaceStyle } from "@/lib/card-styles";
import { resolveLinkStyle } from "@/lib/card-layout-config";
import ProfileLinksDisplay from "./ProfileLinksDisplay";
import {
  getCardScale,
  ProfileAvatar,
  ProfileBio,
  ProfileFooterBrand,
  ProfileNameBlock,
  ProfileViews,
} from "./ProfileCardParts";
import { CardToolbarSlot } from "./ProfileCardToolbar";

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
      className={`relative rounded-2xl border shadow-2xl ${pad} ${className}`}
      style={cardStyle}
    >
      <CardToolbarSlot />
      {children}
    </div>
  );
}

function LinksBlock({ profile, compact }: { profile: Profile; compact?: boolean }) {
  const { settings } = profile;
  const linkStyle = resolveLinkStyle(settings);
  return (
    <ProfileLinksDisplay
      links={profile.links}
      linkStyle={linkStyle}
      accentColor={settings.accentColor}
      glowIcons={settings.glowIcons}
      monochromeIcons={settings.monochromeIcons}
      textColor={settings.textColor}
      compact={compact}
      locale={profile.locale}
      mutedColor={hexToRgba(settings.textColor, 0.3)}
    />
  );
}

export function LayoutClassic({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  return (
    <CardShell profile={profile} compact={compact}>
      <div className="flex flex-col items-center text-center">
        <ProfileAvatar profile={profile} scale={scale} className="mx-auto mb-3" />
        <ProfileNameBlock profile={profile} scale={scale} />
        <ProfileBio profile={profile} scale={scale} className="mt-1.5 mb-2 max-w-full" />
        <ProfileViews profile={profile} scale={scale} className="mb-2 justify-center" />
        <LinksBlock profile={profile} compact={compact} />
      </div>
    </CardShell>
  );
}

export function LayoutHero({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  const heroAvatar = compact ? "w-20 h-20" : "w-28 h-28";
  return (
    <CardShell profile={profile} compact={compact} className={compact ? "" : "pt-10"}>
      <div className="flex flex-col items-center text-center">
        <ProfileAvatar
          profile={profile}
          scale={scale}
          sizeOverride={heroAvatar}
          className="mx-auto mb-4"
        />
        <ProfileNameBlock profile={profile} scale={scale} />
        <ProfileBio profile={profile} scale={scale} className="mt-2 mb-2 max-w-full" />
        <ProfileViews profile={profile} scale={scale} className="mb-4 justify-center" />
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
          <ProfileBio profile={profile} scale={scale} className="mt-2 mb-2" />
          <ProfileViews profile={profile} scale={scale} className="mb-3" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/10">
        <LinksBlock profile={profile} compact={compact} />
      </div>
    </CardShell>
  );
}

export function LayoutBanner({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  const { settings } = profile;
  const frameStyle = getCardFrameStyle(settings);
  const bodyStyle = getCardBodySurfaceStyle(settings);
  const bannerH = compact ? "h-[76px]" : "h-[112px]";
  const bannerSrc = settings.bannerUrl?.trim()
    ? getMediaSrc(settings.bannerUrl)
    : null;
  const avatarSize = compact ? "w-[60px] h-[60px]" : "w-[84px] h-[84px]";
  const overlap = compact ? "-mt-[30px]" : "-mt-[42px]";

  return (
    <div
      className="relative rounded-2xl border overflow-hidden w-full"
      style={frameStyle}
    >
      <CardToolbarSlot />
      <div
        className={`${bannerH} w-full relative bg-cover bg-center shrink-0`}
        style={
          bannerSrc
            ? { backgroundImage: `url(${bannerSrc})` }
            : {
                background: `linear-gradient(135deg, ${settings.accentColor} 0%, ${hexToRgba(settings.cardColorSecondary || settings.accentColor, 0.9)} 55%, ${hexToRgba(settings.cardColor, 1)} 100%)`,
              }
        }
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/45" />
      </div>

      <div
        className={`relative border-t border-white/10 ${compact ? "px-3.5 pb-3.5" : "px-5 pb-5"}`}
        style={bodyStyle}
      >
        <div className={`relative z-10 flex justify-center ${overlap} mb-1`}>
          <ProfileAvatar
            profile={profile}
            scale={scale}
            sizeOverride={avatarSize}
            className="ring-[3px] ring-[#0a0a0f]/80 shadow-lg shadow-black/40"
          />
        </div>

        <div className="flex flex-col items-center text-center">
          <ProfileNameBlock profile={profile} scale={scale} />
          <ProfileBio profile={profile} scale={scale} className="mt-1.5 mb-1.5" />
          <ProfileViews profile={profile} scale={scale} className="mb-2 justify-center" />
          <LinksBlock profile={profile} compact={compact} />
        </div>
      </div>
    </div>
  );
}

export function LayoutMinimal({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  const cardStyle = getCardSurfaceStyle(profile.settings);
  const minimalStyle =
    profile.settings.transparentCard
      ? { ...cardStyle, background: "transparent", border: "none", boxShadow: "none" }
      : cardStyle;

  return (
    <div
      className={`relative rounded-2xl ${compact ? "p-2" : "p-4"} text-center`}
      style={minimalStyle}
    >
      <CardToolbarSlot />
      <ProfileAvatar
        profile={profile}
        scale={scale}
        sizeOverride={compact ? "w-14 h-14" : "w-20 h-20"}
        className="mx-auto mb-2"
      />
      <ProfileNameBlock profile={profile} scale={scale} />
      <ProfileBio profile={profile} scale={scale} className="mt-1 mb-2 mx-auto" />
      <ProfileViews profile={profile} scale={scale} className="mb-3 justify-center" />
      <LinksBlock profile={profile} compact={compact} />
    </div>
  );
}

export function LayoutStack({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  return (
    <CardShell profile={profile} compact={compact}>
      <div className="flex flex-col items-center text-center mb-2">
        <ProfileAvatar profile={profile} scale={scale} className="mx-auto mb-2" />
        <ProfileNameBlock profile={profile} scale={scale} />
        <ProfileBio profile={profile} scale={scale} className="mt-1 mb-2" />
        <ProfileViews profile={profile} scale={scale} className="justify-center" />
      </div>
      <LinksBlock profile={profile} compact={compact} />
    </CardShell>
  );
}

export function LayoutGlass({ profile, compact }: LayoutProps) {
  const scale = getCardScale(!!compact);
  return (
    <CardShell profile={profile} compact={compact} className={compact ? "max-w-[260px]" : "max-w-md"}>
      <div className="flex flex-col items-center text-center">
        <ProfileAvatar profile={profile} scale={scale} className="mx-auto mb-3" />
        <ProfileNameBlock profile={profile} scale={scale} />
        <ProfileBio profile={profile} scale={scale} className="mt-2 mb-3" />
      </div>
      <div
        className={`flex items-end justify-between gap-3 pt-3 border-t border-white/10 ${
          compact ? "flex-col items-center" : ""
        }`}
      >
        <ProfileViews profile={profile} scale={scale} />
        <div className={compact ? "w-full flex justify-center" : "shrink-0"}>
          <LinksBlock profile={profile} compact={compact} />
        </div>
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
  if (showcase) {
    return (
      <div
        className={`relative w-full mx-auto pointer-events-none select-none ${maxWidth ?? "max-w-[240px]"}`}
      >
        {children}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`relative w-full mx-auto ${maxWidth ?? "max-w-[260px]"}`}>
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
      className={`relative w-full mx-auto ${maxWidth ?? "max-w-md"}`}
    >
      {children}
      <ProfileFooterBrand profile={profile} compact={false} />
    </motion.div>
  );
}
