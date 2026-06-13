"use client";

import { MapPin } from "lucide-react";
import { Profile } from "@/types/profile";
import { hexToRgba } from "@/lib/color-utils";
import { resolveProfileDisplay } from "@/lib/profile-display-config";
import { isValidDiscordUserId } from "@/lib/lanyard";
import ProfileDiscordPresence from "./ProfileDiscordPresence";
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
  const { settings, locale } = profile;
  const display = resolveProfileDisplay(settings);
  const location = display.location.trim();
  const showLocation = display.showLocation && location.length > 0;
  const showDiscord =
    display.discordPresenceEnabled &&
    isValidDiscordUserId(display.discordUserId);

  if (!showLocation && !showDiscord) return null;

  const alignClass = align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <div className={`flex w-full flex-col gap-2 ${alignClass} ${className}`}>
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
          userId={display.discordUserId}
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
