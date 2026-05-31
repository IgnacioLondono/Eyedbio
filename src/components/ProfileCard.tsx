"use client";

import { motion } from "framer-motion";
import { Eye, Crown, CheckCircle, Star } from "lucide-react";
import { Profile } from "@/types/profile";
import SocialLinks from "./SocialLinks";

const BADGE_CONFIG: Record<string, { icon: typeof Crown; color: string; label: string }> = {
  premium: { icon: Crown, color: "#f59e0b", label: "Premium" },
  verified: { icon: CheckCircle, color: "#3b82f6", label: "Verificado" },
  og: { icon: Star, color: "#a855f7", label: "OG" },
};

interface Props {
  profile: Profile;
}

export default function ProfileCard({ profile }: Props) {
  const { settings } = profile;

  const cardStyle: React.CSSProperties = {
    background: settings.gradientEnabled
      ? `linear-gradient(135deg, rgba(255,255,255,${settings.profileOpacity}) 0%, rgba(168,85,247,${settings.profileOpacity * 0.5}) 100%)`
      : `rgba(255,255,255,${settings.profileOpacity})`,
    backdropFilter: `blur(${settings.profileBlur}px)`,
    WebkitBackdropFilter: `blur(${settings.profileBlur}px)`,
    borderColor: `${settings.accentColor}33`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-md mx-auto"
    >
      <div
        className="rounded-2xl border p-8 shadow-2xl"
        style={cardStyle}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative mb-4"
          >
            <div
              className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/20"
              style={{
                boxShadow: settings.glowUsername
                  ? `0 0 30px ${settings.accentColor}66`
                  : undefined,
              }}
            >
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <div className="flex items-center gap-2 mb-1">
            <h1
              className="text-2xl font-bold text-white"
              style={{
                textShadow: settings.glowUsername
                  ? `0 0 20px ${settings.accentColor}`
                  : undefined,
              }}
            >
              {profile.displayName}
            </h1>
            {profile.badges.map((badge) => {
              const config = BADGE_CONFIG[badge];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <span
                  key={badge}
                  title={config.label}
                  className="inline-flex"
                  style={{
                    filter: settings.glowIcons
                      ? `drop-shadow(0 0 6px ${config.color})`
                      : undefined,
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: config.color }}
                  />
                </span>
              );
            })}
          </div>

          <p className="text-white/60 text-sm mb-1">@{profile.username}</p>

          {profile.bio && (
            <p className="text-white/80 text-sm mb-4 max-w-xs">{profile.bio}</p>
          )}

          <div className="flex items-center gap-1.5 text-white/40 text-xs mb-6">
            <Eye className="w-3.5 h-3.5" />
            <span>{profile.views.toLocaleString()} visitas</span>
          </div>

          <SocialLinks
            links={profile.links}
            accentColor={settings.accentColor}
            glowIcons={settings.glowIcons}
            monochromeIcons={settings.monochromeIcons}
          />
        </div>
      </div>

      <p className="text-center text-white/20 text-xs mt-6">
        eyed.bio/{profile.username}
      </p>
    </motion.div>
  );
}
