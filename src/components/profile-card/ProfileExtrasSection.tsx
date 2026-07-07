"use client";

import { MapPin } from "lucide-react";
import { Profile } from "@/types/profile";
import { hexToRgba } from "@/lib/config/color-utils";
import { resolveProfileDisplay } from "@/lib/profile/profile-display-config";
import { isValidDiscordUserId } from "@/lib/discord/lanyard";
import {
  getSocialLinkCopyValue,
  isSocialLinkActive,
} from "@/lib/social-link-utils";
import ProfileDiscordPresence from "./ProfileDiscordPresence";
import ProfileMusicPlayer from "@/components/profile/ProfileMusicPlayer";
import { isMusicPlayerEnabled } from "@/lib/profile/music-player-config";
import type { CardScale } from "./ProfileCardParts";

interface Props {
  profile: Profile;
  scale: CardScale;
  compact?: boolean;
  align?: "center" | "left";
  className?: string;
}

export default function ProfileExtrasSection({
  profile,
  scale,
  compact,
  align = "center",
  className = "",
}: Props) {
  const { settings, locale, links } = profile;
  const display = resolveProfileDisplay(settings);
  const location = display.location.trim();
  const showLocation = display.showLocation && location.length > 0;

  const discordLink = links.find(
    (link) => link.platform === "discord" && isSocialLinkActive(link)
  );
  const fallbackUsername = discordLink ? getSocialLinkCopyValue(discordLink) : undefined;
  const discordUserId = display.discordUserId.trim();
  const showDiscord =
    display.discordPresenceEnabled &&
    (isValidDiscordUserId(discordUserId) || Boolean(fallbackUsername));

  const showMusic = isMusicPlayerEnabled(settings);

  if (!showLocation && !showDiscord && !showMusic) return null;

  const alignClass = align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <div className={`flex w-full flex-col gap-2 ${alignClass} ${className}`}>
      {showMusic ? <ProfileMusicPlayer profile={profile} compact={compact} /> : null}
      {showLocation ? (
        <div
          className={`inline-flex max-w-full items-center gap-1.5 ${scale.location}`}
          style={{ color: hexToRgba(settings.textColor, 0.65) }}
        >
          <MapPin
            className={scale.locationIcon}
            style={{ color: hexToRgba(settings.accentColor, 0.9) }}
          />
          <span className="truncate">{location}</span>
        </div>
      ) : null}
      {showDiscord ? (
        <ProfileDiscordPresence
          userId={discordUserId}
          fallbackUsername={fallbackUsername ?? undefined}
          accentColor={settings.accentColor}
          textColor={settings.textColor}
          scale={scale}
          locale={locale}
          compact={compact}
        />
      ) : null}
    </div>
  );
}
