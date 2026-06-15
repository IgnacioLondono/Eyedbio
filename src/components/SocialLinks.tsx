"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { SocialLink, SocialPlatform, ProfileSettings } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import { PlatformIcon } from "@/components/PlatformIcons";
import CustomLinkIcon from "@/components/CustomLinkIcon";
import { isSocialLinkActive } from "@/lib/social-link-utils";
import { useSocialLinkAction } from "@/components/profile-card/useSocialLinkAction";
import {
  getIconContainerStyle,
  getIconShapeClass,
  getLinkIconColor,
  getPlatformLinkColor,
  resolveIconStyle,
} from "@/lib/icon-style-config";

interface Props {
  links: SocialLink[];
  settings: Pick<ProfileSettings, "accentColor" | "glowIcons" | "monochromeIcons" | "iconColorMode" | "iconColor" | "customLinkIconColor" | "iconBackgroundColor" | "iconShape">;
  compact?: boolean;
  mutedColor?: string;
  emptyLabel?: string;
  copyHint?: string;
  copiedLabel?: string;
}

function LinkIcon({
  link,
  color,
  compact,
  glowIcons,
}: {
  link: SocialLink;
  color: string;
  compact: boolean;
  glowIcons?: boolean;
}) {
  const size = compact ? "w-4 h-4" : "w-5 h-5";

  if (link.iconUrl) {
    return (
      <CustomLinkIcon
        iconUrl={link.iconUrl}
        color={color}
        sizeClass={size}
        glowIcons={glowIcons}
      />
    );
  }

  if (link.platform === "custom") {
    return <Globe className={`${size} text-white/70`} style={{ color }} />;
  }

  return <PlatformIcon platform={link.platform as SocialPlatform} />;
}

function SocialLinkButton({
  link,
  settings,
  compact,
  copyHint,
  copiedLabel,
  index,
}: {
  link: SocialLink;
  settings: Props["settings"];
  compact: boolean;
  copyHint?: string;
  copiedLabel?: string;
  index: number;
}) {
  const iconStyle = resolveIconStyle(settings as ProfileSettings);
  const config = PLATFORM_CONFIG[link.platform];
  const color = getPlatformLinkColor(iconStyle, config.color);
  const iconColor = getLinkIconColor(iconStyle, config.color, Boolean(link.iconUrl));
  const { copyOnly, href, title, copied, activate } = useSocialLinkAction(link);
  const iconSize = compact ? "w-9 h-9" : "w-12 h-12";
  const shapeClass = getIconShapeClass(iconStyle.iconShape);
  const containerStyle = getIconContainerStyle(iconStyle);
  const tooltip = copyOnly
    ? copied
      ? (copiedLabel ?? title)
      : `${title}${copyHint ? ` · ${copyHint}` : ""}`
    : title;

  const className = `flex items-center justify-center ${iconSize} ${shapeClass} bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors overflow-hidden`;
  const style = {
    color: link.iconUrl ? undefined : color,
    filter: iconStyle.glowIcons ? `drop-shadow(0 0 8px ${color})` : undefined,
    ...containerStyle,
  } as const;

  if (copyOnly) {
    return (
      <motion.button
        type="button"
        key={link.id}
        onClick={() => void activate()}
        initial={compact ? false : { opacity: 0, scale: 0.5 }}
        animate={compact ? undefined : { opacity: 1, scale: 1 }}
        transition={compact ? undefined : { delay: 0.3 + index * 0.08 }}
        whileHover={{ scale: 1.15, y: -2 }}
        whileTap={{ scale: 0.95 }}
        title={tooltip}
        aria-label={tooltip}
        className={`${className} cursor-copy`}
        style={style}
      >
        <LinkIcon link={link} color={iconColor} compact={compact} glowIcons={iconStyle.glowIcons} />
      </motion.button>
    );
  }

  return (
    <motion.a
      key={link.id}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={compact ? false : { opacity: 0, scale: 0.5 }}
      animate={compact ? undefined : { opacity: 1, scale: 1 }}
      transition={compact ? undefined : { delay: 0.3 + index * 0.08 }}
      whileHover={{ scale: 1.15, y: -2 }}
      whileTap={{ scale: 0.95 }}
      title={title}
      className={className}
      style={style}
    >
      <LinkIcon link={link} color={iconColor} compact={compact} glowIcons={iconStyle.glowIcons} />
    </motion.a>
  );
}

export default function SocialLinks({
  links,
  settings,
  compact = false,
  mutedColor = "rgba(255,255,255,0.3)",
  emptyLabel = "Sin enlaces aún",
  copyHint,
  copiedLabel,
}: Props) {
  if (links.length === 0) {
    return (
      <p className="w-full text-center text-sm italic" style={{ color: mutedColor }}>
        {emptyLabel}
      </p>
    );
  }

  const visibleLinks = links.filter(isSocialLinkActive);

  if (visibleLinks.length === 0) {
    return (
      <p className="w-full text-center text-sm italic" style={{ color: mutedColor }}>
        {emptyLabel}
      </p>
    );
  }

  const gap = compact ? "gap-2" : "gap-3";

  return (
    <div className={`flex w-full flex-wrap justify-center ${gap}`}>
      {visibleLinks.map((link, i) => (
        <SocialLinkButton
          key={link.id}
          link={link}
          settings={settings}
          compact={compact}
          copyHint={copyHint}
          copiedLabel={copiedLabel}
          index={i}
        />
      ))}
    </div>
  );
}
