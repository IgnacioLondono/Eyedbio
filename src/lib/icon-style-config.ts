import type { CSSProperties } from "react";
import type { ProfileSettings } from "@/types/profile";
import { hexToRgba } from "@/lib/color-utils";

export type IconColorMode = "platform" | "unified";
export type IconShape = "rounded" | "circle" | "square";

export const ICON_COLOR_MODE_OPTIONS: {
  value: IconColorMode;
  labelKey: "dashboard.iconColorModePlatform" | "dashboard.iconColorModeUnified";
}[] = [
  { value: "platform", labelKey: "dashboard.iconColorModePlatform" },
  { value: "unified", labelKey: "dashboard.iconColorModeUnified" },
];

export const ICON_SHAPE_OPTIONS: {
  value: IconShape;
  labelKey: "dashboard.iconShapeRounded" | "dashboard.iconShapeCircle" | "dashboard.iconShapeSquare";
}[] = [
  { value: "rounded", labelKey: "dashboard.iconShapeRounded" },
  { value: "circle", labelKey: "dashboard.iconShapeCircle" },
  { value: "square", labelKey: "dashboard.iconShapeSquare" },
];

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
    settings.iconShape === "rounded" ||
    settings.iconShape === "circle" ||
    settings.iconShape === "square"
  ) {
    return settings.iconShape;
  }
  return "rounded";
}

export function resolveProfileNameIconShape(settings: Partial<ProfileSettings>): IconShape {
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
  if (shape === "circle") return "rounded-full";
  if (shape === "square") return "rounded-none";
  return "rounded-xl";
}

export function getIconContainerStyle(
  iconStyle: ResolvedIconStyle
): CSSProperties | undefined {
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
