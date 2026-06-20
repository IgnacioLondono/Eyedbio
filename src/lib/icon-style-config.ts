import type { CSSProperties } from "react";
import type { ProfileSettings } from "@/types/profile";
import { hexToRgba } from "@/lib/color-utils";

export type IconColorMode = "platform" | "unified";
export type IconShape = "rounded" | "circle" | "square" | "none";
export type ProfileNameIconShape = "rounded" | "circle" | "square";

export const ICON_COLOR_MODE_OPTIONS: {
  value: IconColorMode;
  labelKey: "dashboard.iconColorModePlatform" | "dashboard.iconColorModeUnified";
}[] = [
  { value: "platform", labelKey: "dashboard.iconColorModePlatform" },
  { value: "unified", labelKey: "dashboard.iconColorModeUnified" },
];

export const ICON_SHAPE_OPTIONS: {
  value: IconShape;
  labelKey:
    | "dashboard.iconShapeRounded"
    | "dashboard.iconShapeCircle"
    | "dashboard.iconShapeSquare"
    | "dashboard.iconShapeNone";
}[] = [
  { value: "none", labelKey: "dashboard.iconShapeNone" },
  { value: "rounded", labelKey: "dashboard.iconShapeRounded" },
  { value: "circle", labelKey: "dashboard.iconShapeCircle" },
  { value: "square", labelKey: "dashboard.iconShapeSquare" },
];

/** Formas con contenedor visible (fondo/borde). El icono junto al nombre no usa "none". */
export const PROFILE_NAME_ICON_SHAPE_OPTIONS = ICON_SHAPE_OPTIONS.filter(
  (opt) => opt.value !== "none"
);

export interface ResolvedIconStyle {
  unifiedColor: boolean;
  iconColor: string;
  customIconColor: string;
  iconBackgroundColor?: string;
  iconShape: IconShape;
  glowIcons: boolean;
}

export function resolveIconColorMode(settings: Partial<ProfileSettings>): IconColorMode {
  if (settings.iconColorMode === "platform" || settings.iconColorMode === "unified") {
    return settings.iconColorMode;
  }
  return settings.monochromeIcons ? "unified" : "platform";
}

export function resolveIconShape(settings: Partial<ProfileSettings>): IconShape {
  if (
    settings.iconShape === "none" ||
    settings.iconShape === "rounded" ||
    settings.iconShape === "circle" ||
    settings.iconShape === "square"
  ) {
    return settings.iconShape;
  }
  return "rounded";
}

export function isPlainLinkIcons(shape: IconShape): boolean {
  return shape === "none";
}

export function resolveProfileNameIconShape(
  settings: Partial<ProfileSettings>
): ProfileNameIconShape {
  if (
    settings.profileNameIconShape === "rounded" ||
    settings.profileNameIconShape === "circle" ||
    settings.profileNameIconShape === "square"
  ) {
    return settings.profileNameIconShape;
  }
  return "rounded";
}

export function resolveIconStyle(settings: ProfileSettings): ResolvedIconStyle {
  const unified = resolveIconColorMode(settings) === "unified";
  const iconColor = settings.iconColor?.trim() || settings.accentColor;
  const customIconColor = settings.customLinkIconColor?.trim() || iconColor;

  return {
    unifiedColor: unified,
    iconColor,
    customIconColor,
    iconBackgroundColor: settings.iconBackgroundColor?.trim() || undefined,
    iconShape: resolveIconShape(settings),
    glowIcons: settings.glowIcons,
  };
}

export function getPlatformLinkColor(iconStyle: ResolvedIconStyle, platformColor: string): string {
  return iconStyle.unifiedColor ? iconStyle.iconColor : platformColor;
}

export function getLinkIconColor(
  iconStyle: ResolvedIconStyle,
  platformColor: string,
  hasCustomIcon: boolean
): string {
  if (hasCustomIcon) return iconStyle.customIconColor;
  return getPlatformLinkColor(iconStyle, platformColor);
}

export function getIconShapeClass(shape: IconShape): string {
  if (shape === "none") return "";
  if (shape === "circle") return "rounded-full";
  if (shape === "square") return "rounded-none";
  return "rounded-xl";
}

export function getIconLinkWrapperClass(
  iconStyle: ResolvedIconStyle,
  containerSize: string,
  variant: "icons" | "row" = "icons"
): string {
  if (isPlainLinkIcons(iconStyle.iconShape)) {
    return `flex items-center justify-center ${containerSize} hover:opacity-80 active:opacity-65 transition-opacity`;
  }

  const shapeClass = getIconShapeClass(iconStyle.iconShape);
  if (variant === "row") {
    return `flex items-center justify-center ${containerSize} ${shapeClass} bg-white/10 border border-white/15 hover:bg-white/20 transition-colors overflow-hidden`;
  }

  return `flex items-center justify-center ${containerSize} ${shapeClass} bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors overflow-hidden`;
}

export function getIconContainerStyle(
  iconStyle: ResolvedIconStyle
): CSSProperties | undefined {
  if (isPlainLinkIcons(iconStyle.iconShape)) return undefined;
  if (!iconStyle.iconBackgroundColor) return undefined;
  return {
    backgroundColor: hexToRgba(iconStyle.iconBackgroundColor, 0.18),
    borderColor: hexToRgba(iconStyle.iconBackgroundColor, 0.35),
  };
}

export function settingsForIconColorMode(mode: IconColorMode): Pick<
  ProfileSettings,
  "iconColorMode" | "monochromeIcons"
> {
  return {
    iconColorMode: mode,
    monochromeIcons: mode === "unified",
  };
}
