"use client";

import { motion } from "framer-motion";
import { SocialLink, SocialPlatform } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import { PlatformIcon } from "@/components/PlatformIcons";

interface Props {
  links: SocialLink[];
  accentColor: string;
  glowIcons: boolean;
  monochromeIcons: boolean;
}

export default function SocialLinks({
  links,
  accentColor,
  glowIcons,
  monochromeIcons,
}: Props) {
  if (links.length === 0) {
    return (
      <p className="text-white/30 text-sm italic">Sin enlaces aún</p>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {links.map((link, i) => {
        const config = PLATFORM_CONFIG[link.platform];
        const color = monochromeIcons ? accentColor : config.color;

        return (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.95 }}
            title={link.label ?? config.label}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors"
            style={{
              color,
              filter: glowIcons ? `drop-shadow(0 0 8px ${color})` : undefined,
            }}
          >
            <PlatformIcon platform={link.platform as SocialPlatform} />
          </motion.a>
        );
      })}
    </div>
  );
}
