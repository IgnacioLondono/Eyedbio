"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { SocialLink, SocialPlatform } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import { PlatformIcon } from "@/components/PlatformIcons";
import { getMediaSrc } from "@/lib/media-url";

interface Props {
  links: SocialLink[];
  accentColor: string;
  glowIcons: boolean;
  monochromeIcons: boolean;
  compact?: boolean;
  mutedColor?: string;
  emptyLabel?: string;
}

function LinkIcon({
  link,
  color,
  compact,
}: {
  link: SocialLink;
  color: string;
  compact: boolean;
}) {
  const size = compact ? "w-4 h-4" : "w-5 h-5";

  if (link.iconUrl) {
    return (
      <img
        src={getMediaSrc(link.iconUrl)}
        alt=""
        className={`${size} object-contain`}
      />
    );
  }

  if (link.platform === "custom") {
    return <Globe className={`${size} text-white/70`} style={{ color }} />;
  }

  return <PlatformIcon platform={link.platform as SocialPlatform} />;
}

export default function SocialLinks({
  links,
  accentColor,
  glowIcons,
  monochromeIcons,
  compact = false,
  mutedColor = "rgba(255,255,255,0.3)",
  emptyLabel = "Sin enlaces aún",
}: Props) {
  if (links.length === 0) {
    return (
      <p className="text-sm italic" style={{ color: mutedColor }}>
        {emptyLabel}
      </p>
    );
  }

  const visibleLinks = links.filter((link) => link.url.trim().length > 0);

  if (visibleLinks.length === 0) {
    return (
      <p className="text-sm italic" style={{ color: mutedColor }}>
        {emptyLabel}
      </p>
    );
  }

  const iconSize = compact ? "w-9 h-9" : "w-12 h-12";
  const gap = compact ? "gap-2" : "gap-3";

  return (
    <div className={`flex flex-wrap justify-center ${gap}`}>
      {visibleLinks.map((link, i) => {
        const config = PLATFORM_CONFIG[link.platform];
        const color = monochromeIcons ? accentColor : config.color;
        const title = link.label ?? config.label;

        return (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={compact ? false : { opacity: 0, scale: 0.5 }}
            animate={compact ? undefined : { opacity: 1, scale: 1 }}
            transition={compact ? undefined : { delay: 0.3 + i * 0.08 }}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.95 }}
            title={title}
            className={`flex items-center justify-center ${iconSize} rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors overflow-hidden`}
            style={{
              color: link.iconUrl ? undefined : color,
              filter: glowIcons && !link.iconUrl ? `drop-shadow(0 0 8px ${color})` : undefined,
            }}
          >
            <LinkIcon link={link} color={color} compact={compact} />
          </motion.a>
        );
      })}
    </div>
  );
}
