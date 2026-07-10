"use client";

import type { SocialPlatform } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/config/platforms";
import { PlatformIcon } from "@/components/shared/PlatformIcons";

const LIGHT_BRAND_COLORS = new Set(["#ffffff", "#fffc00", "#53fc18"]);

const TILE_SIZES = {
  sm: { box: "h-10 w-10 rounded-lg", icon: "[&_svg]:h-5 [&_svg]:w-5" },
  md: { box: "h-12 w-12 rounded-xl", icon: "[&_svg]:h-6 [&_svg]:w-6" },
  lg: { box: "h-14 w-14 rounded-xl", icon: "[&_svg]:h-7 [&_svg]:w-7" },
} as const;

function tileStyles(color: string) {
  const normalized = color.toLowerCase();
  const isLight = LIGHT_BRAND_COLORS.has(normalized);

  if (isLight) {
    return {
      backgroundColor: "rgba(255,255,255,0.07)",
      borderColor: "rgba(255,255,255,0.14)",
      color,
    };
  }

  return {
    backgroundColor: `color-mix(in srgb, ${color} 24%, #12121a)`,
    borderColor: `color-mix(in srgb, ${color} 42%, transparent)`,
    color,
  };
}

export function getPlatformTileStyles(color: string) {
  return tileStyles(color);
}

type Props = {
  platform: SocialPlatform;
  size?: keyof typeof TILE_SIZES;
  title?: string;
  onClick?: () => void;
  className?: string;
  as?: "button" | "div";
};

export default function PlatformBrandTile({
  platform,
  size = "md",
  title,
  onClick,
  className = "",
  as = "button",
}: Props) {
  const config = PLATFORM_CONFIG[platform];
  const styles = tileStyles(config.color);
  const sizeClass = TILE_SIZES[size];
  const sharedClassName = `inline-flex shrink-0 items-center justify-center border transition-all ${sizeClass.box} ${sizeClass.icon} ${className}`;

  if (as === "div") {
    return (
      <div
        className={sharedClassName}
        style={styles}
        title={title ?? config.label}
        aria-hidden={title ? undefined : true}
      >
        <PlatformIcon platform={platform} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? config.label}
      className={`${sharedClassName} hover:scale-105 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50`}
      style={styles}
    >
      <PlatformIcon platform={platform} />
    </button>
  );
}