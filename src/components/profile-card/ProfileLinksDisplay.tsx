"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { SocialLink, SocialPlatform } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import { PlatformIcon } from "@/components/PlatformIcons";
import { getMediaSrc } from "@/lib/media-url";
import { hexToRgba } from "@/lib/color-utils";
import type { LinkStyle } from "@/types/profile";
import SocialLinks from "@/components/SocialLinks";
import { t as translate } from "@/lib/i18n";

interface Props {
  links: SocialLink[];
  linkStyle: LinkStyle;
  accentColor: string;
  glowIcons: boolean;
  monochromeIcons: boolean;
  textColor: string;
  compact?: boolean;
  locale?: "es" | "en";
  mutedColor?: string;
}

function LinkIcon({
  link,
  color,
  sizeClass,
}: {
  link: SocialLink;
  color: string;
  sizeClass: string;
}) {
  if (link.iconUrl) {
    return (
      <img src={getMediaSrc(link.iconUrl)} alt="" className={`${sizeClass} object-contain`} />
    );
  }
  if (link.platform === "custom") {
    return <Globe className={`${sizeClass} text-white/70`} style={{ color }} />;
  }
  return <PlatformIcon platform={link.platform as SocialPlatform} />;
}

function EmptyLinks({ mutedColor, locale = "es" }: { mutedColor: string; locale?: "es" | "en" }) {
  return (
    <p className="text-sm italic" style={{ color: mutedColor }}>
      {translate(locale, "profile.noLinks")}
    </p>
  );
}

function PillsLinks({
  links,
  accentColor,
  glowIcons,
  monochromeIcons,
  textColor,
  compact,
  locale = "es",
  mutedColor,
}: Omit<Props, "linkStyle">) {
  const visible = links.filter((l) => l.url.trim().length > 0);
  if (visible.length === 0) return <EmptyLinks mutedColor={mutedColor ?? "rgba(255,255,255,0.3)"} locale={locale} />;

  return (
    <div className={`w-full flex flex-col ${compact ? "gap-1" : "gap-1.5"}`}>
      {visible.map((link, i) => {
        const config = PLATFORM_CONFIG[link.platform];
        const color = monochromeIcons ? accentColor : config.color;
        const title = link.label ?? config.label;
        const iconSize = compact ? "w-3.5 h-3.5" : "w-4 h-4";

        return (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={compact ? false : { opacity: 0, x: -6 }}
            animate={compact ? undefined : { opacity: 1, x: 0 }}
            transition={compact ? undefined : { delay: 0.2 + i * 0.04 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2.5 w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${
              compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"
            }`}
            style={{
              borderLeftColor: color,
              borderLeftWidth: 2,
            }}
          >
            <span
              className={`flex shrink-0 items-center justify-center ${compact ? "w-7 h-7" : "w-8 h-8"} rounded-md bg-white/5`}
              style={{
                color: link.iconUrl ? undefined : color,
                filter: glowIcons && !link.iconUrl ? `drop-shadow(0 0 6px ${color})` : undefined,
              }}
            >
              <LinkIcon link={link} color={color} sizeClass={iconSize} />
            </span>
            <span className="font-medium truncate" style={{ color: textColor }}>
              {title}
            </span>
          </motion.a>
        );
      })}
    </div>
  );
}

function RowLinks({
  links,
  accentColor,
  glowIcons,
  monochromeIcons,
  compact,
  locale = "es",
  mutedColor,
}: Omit<Props, "linkStyle" | "textColor">) {
  const visible = links.filter((l) => l.url.trim().length > 0);
  if (visible.length === 0) return <EmptyLinks mutedColor={mutedColor ?? "rgba(255,255,255,0.3)"} locale={locale} />;

  const btn = compact ? "w-8 h-8" : "w-10 h-10";
  const icon = compact ? "w-4 h-4" : "w-4 h-4";

  return (
    <div className={`flex flex-wrap justify-center gap-2 ${compact ? "" : "gap-2.5"}`}>
      {visible.map((link) => {
        const config = PLATFORM_CONFIG[link.platform];
        const color = monochromeIcons ? accentColor : config.color;
        const title = link.label ?? config.label;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={title}
            className={`flex items-center justify-center ${btn} rounded-full bg-white/10 border border-white/15 hover:bg-white/20 transition-colors`}
            style={{
              color: link.iconUrl ? undefined : color,
              filter: glowIcons && !link.iconUrl ? `drop-shadow(0 0 6px ${color})` : undefined,
            }}
          >
            <LinkIcon link={link} color={color} sizeClass={icon} />
          </a>
        );
      })}
    </div>
  );
}

function ChipsLinks({
  links,
  accentColor,
  glowIcons,
  monochromeIcons,
  textColor,
  compact,
  locale = "es",
  mutedColor,
}: Omit<Props, "linkStyle">) {
  const visible = links.filter((l) => l.url.trim().length > 0);
  if (visible.length === 0) return <EmptyLinks mutedColor={mutedColor ?? "rgba(255,255,255,0.3)"} locale={locale} />;

  return (
    <div className={`flex flex-wrap justify-center ${compact ? "gap-1.5" : "gap-2"}`}>
      {visible.map((link) => {
        const config = PLATFORM_CONFIG[link.platform];
        const color = monochromeIcons ? accentColor : config.color;
        const title = link.label ?? config.label;
        const iconSize = compact ? "w-3.5 h-3.5" : "w-4 h-4";

        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 ${
              compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
            }`}
            style={{
              color: textColor,
              filter: glowIcons ? `drop-shadow(0 0 4px ${hexToRgba(color, 0.4)})` : undefined,
            }}
          >
            <span style={{ color: link.iconUrl ? undefined : color }}>
              <LinkIcon link={link} color={color} sizeClass={iconSize} />
            </span>
            <span className="truncate max-w-[100px]">{title}</span>
          </a>
        );
      })}
    </div>
  );
}

export default function ProfileLinksDisplay({
  links,
  linkStyle,
  accentColor,
  glowIcons,
  monochromeIcons,
  textColor,
  compact = false,
  locale = "es",
  mutedColor,
}: Props) {
  const muted = mutedColor ?? hexToRgba(textColor, 0.3);

  if (linkStyle === "icons") {
    return (
      <SocialLinks
        links={links}
        accentColor={accentColor}
        glowIcons={glowIcons}
        monochromeIcons={monochromeIcons}
        compact={compact}
        mutedColor={muted}
        emptyLabel={translate(locale, "profile.noLinks")}
      />
    );
  }

  const shared = {
    links,
    accentColor,
    glowIcons,
    monochromeIcons,
    textColor,
    compact,
    locale,
    mutedColor: muted,
  };

  if (linkStyle === "pills") return <PillsLinks {...shared} />;
  if (linkStyle === "row") return <RowLinks {...shared} />;
  return <ChipsLinks {...shared} />;
}
