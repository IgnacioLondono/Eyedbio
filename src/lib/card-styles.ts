import type { CSSProperties } from "react";
import { ProfileSettings } from "@/types/profile";
import { hexToRgba } from "@/lib/color-utils";

export function resolveCardSettings(settings: Partial<ProfileSettings>): {
  transparentCard: boolean;
  showCardBorder: boolean;
  showCardShadow: boolean;
  borderOpacity: number;
} {
  return {
    transparentCard: settings.transparentCard ?? false,
    showCardBorder: settings.showCardBorder ?? true,
    showCardShadow: settings.showCardShadow ?? true,
    borderOpacity: settings.borderOpacity ?? 0.2,
  };
}

export function getCardSurfaceStyle(settings: ProfileSettings): CSSProperties {
  const { transparentCard, showCardBorder, showCardShadow, borderOpacity } =
    resolveCardSettings(settings);

  let background: string;
  if (transparentCard) {
    background = "transparent";
  } else if (settings.gradientEnabled) {
    background = `linear-gradient(135deg, ${hexToRgba(settings.cardColor, settings.profileOpacity)} 0%, ${hexToRgba(settings.cardColorSecondary, settings.profileOpacity)} 100%)`;
  } else {
    background = hexToRgba(settings.cardColor, settings.profileOpacity);
  }

  const blur = settings.profileBlur;

  return {
    background,
    backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
    WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
    borderColor: showCardBorder
      ? hexToRgba(settings.accentColor, borderOpacity)
      : "transparent",
    borderWidth: showCardBorder ? 1 : 0,
    boxShadow: showCardShadow ? "0 25px 50px -12px rgba(0, 0, 0, 0.45)" : "none",
  };
}
