"use client";

import type { SocialPlatform } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/config/platforms";
import { PlatformIcon } from "@/components/shared/PlatformIcons";
import { HintTooltip } from "@/components/shared/HintTooltip";

const LIGHT_BRAND_COLORS = new Set(["#ffffff", "#fffc00", "#53fc18"]);

/** Escala óptica por plataforma para igualar peso visual en el grid. */
const PLATFORM_ICON_SCALE: Partial<Record<SocialPlatform, number>> = {
  youtube: 0.88,
  telegram: 0.92,
  soundcloud: 0.9,
  github: 0.92,
  steam: 0.9,
  linkedin: 0.88,
  facebook: 0.9,
  pinterest: 0.88,
  reddit: 0.9,
  vk: 0.82,
  bluesky: 0.92,
  patreon: 0.88,
  kofi: 0.9,
  signal: 0.9,
  whatsapp: 0.9,
  kick: 0.82,
  xbox: 0.88,
  playstation: 0.9,
  epicgames: 0.85,
  gitlab: 0.9,
  paypal: 0.88,
  snapchat: 0.88,
  threads: 0.88,
  twitter: 0.82,
  tiktok: 0.82,
};

const TILE_SIZES = {
  sm: { box: "h-10 w-10 rounded-lg", iconBox: "h-[62%] w-[62%]" },
  md: { box: "h-12 w-12 rounded-xl", iconBox: "h-[62%] w-[62%]" },
  lg: { box: "h-14 w-14 rounded-xl", iconBox: "h-[60%] w-[60%]" },
} as const;

function tileStyles(color: string) {
  const normalized = color.toLowerCase();
  const isLight = LIGHT_BRAND_COLORS.has(normalized);

  if (isLight) {
    return {
      backgroundColor: "rgba(255,255,255,0.07)",
      borderColor: "rgba(255,255,255,0.14)",
      iconColor: normalized === "#ffffff" ? "#ffffff" : color,
    };
  }

  return {
    backgroundColor: `color-mix(in srgb, ${color} 28%, #12121a)`,
    borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
    iconColor: "#ffffff",
  };
}

export function getPlatformTileStyles(color: string) {
  const styles = tileStyles(color);
  return {
    backgroundColor: styles.backgroundColor,
    borderColor: styles.borderColor,
    color: styles.iconColor,
  };
}

type Props = {
  platform: SocialPlatform;
  size?: keyof typeof TILE_SIZES;
  fill?: boolean;
  title?: string;
  hintDescription?: string;
  onClick?: () => void;
  className?: string;
  as?: "button" | "div";
};

export default function PlatformBrandTile({
  platform,
  size = "md",
  fill = false,
  title,
  hintDescription,
  onClick,
  className = "",
  as = "button",
}: Props) {
  const config = PLATFORM_CONFIG[platform];
  const styles = tileStyles(config.color);
  const sizeClass = TILE_SIZES[size];
  const iconScale = PLATFORM_ICON_SCALE[platform] ?? 1;
  const hintLabel = title ?? config.label;
  const sharedClassName = fill
    ? `flex aspect-square w-full items-center justify-center rounded-xl border transition-all ${className}`
    : `inline-flex shrink-0 items-center justify-center border transition-all ${sizeClass.box} ${className}`;

  const iconNode = (
    <span
      className={`flex items-center justify-center ${sizeClass.iconBox} [&_svg]:h-full [&_svg]:w-full`}
      style={{
        color: styles.iconColor,
        transform: iconScale !== 1 ? `scale(${iconScale})` : undefined,
      }}
    >
      <PlatformIcon platform={platform} />
    </span>
  );

  if (as === "div") {
    return (
      <HintTooltip label={hintLabel} description={hintDescription}>
        <div
          className={sharedClassName}
          style={{
            backgroundColor: styles.backgroundColor,
            borderColor: styles.borderColor,
          }}
          aria-label={hintLabel}
        >
          {iconNode}
        </div>
      </HintTooltip>
    );
  }

  return (
    <HintTooltip label={hintLabel} description={hintDescription}>
      <button
        type="button"
        onClick={onClick}
        aria-label={hintLabel}
        className={`${sharedClassName} hover:scale-105 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50`}
        style={{
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
        }}
      >
        {iconNode}
      </button>
    </HintTooltip>
  );
}