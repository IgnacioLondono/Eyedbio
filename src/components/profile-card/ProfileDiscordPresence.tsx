"use client";

import { useCallback, useEffect, useState } from "react";
import { hexToRgba } from "@/lib/color-utils";
import { proxiedDiscordAvatarUrl, isValidDiscordUserId } from "@/lib/lanyard";
import { t as translate } from "@/lib/i18n";
import type { CardScale } from "./ProfileCardParts";

interface PresencePayload {
  displayName: string;
  avatarUrl: string;
  statusColor: string;
  activityEs: string | null;
  activityEn: string | null;
  fallback?: boolean;
}

interface Props {
  userId: string;
  fallbackUsername?: string;
  accentColor: string;
  textColor: string;
  scale: CardScale;
  locale: "es" | "en";
  compact?: boolean;
  className?: string;
}

const REFRESH_MS = 30_000;

function buildFallbackPresence(
  fallbackUsername: string,
  locale: "es" | "en"
): PresencePayload {
  const name = fallbackUsername.startsWith("@")
    ? fallbackUsername
    : `@${fallbackUsername}`;

  return {
    displayName: name,
    avatarUrl: proxiedDiscordAvatarUrl(
      "https://cdn.discordapp.com/embed/avatars/0.png"
    ),
    statusColor: "#80848e",
    activityEs: translate("es", "profile.discordLanyardHint"),
    activityEn: translate("en", "profile.discordLanyardHint"),
    fallback: true,
  };
}

export default function ProfileDiscordPresence({
  userId,
  fallbackUsername,
  accentColor,
  textColor,
  scale,
  locale,
  compact,
  className = "",
}: Props) {
  const [presence, setPresence] = useState<PresencePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPresence = useCallback(async () => {
    if (!isValidDiscordUserId(userId)) {
      if (fallbackUsername?.trim()) {
        return buildFallbackPresence(fallbackUsername.trim(), locale);
      }
      return null;
    }

    try {
      const res = await fetch(`/api/discord/presence/${encodeURIComponent(userId.trim())}`, {
        cache: "no-store",
      });

      if (res.ok) {
        return (await res.json()) as PresencePayload;
      }

      if (fallbackUsername?.trim()) {
        return buildFallbackPresence(fallbackUsername.trim(), locale);
      }

      return null;
    } catch {
      if (fallbackUsername?.trim()) {
        return buildFallbackPresence(fallbackUsername.trim(), locale);
      }
      return null;
    }
  }, [fallbackUsername, locale, userId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void loadPresence()
      .then((data) => {
        if (!cancelled) setPresence(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const interval = window.setInterval(() => {
      void loadPresence().then((data) => {
        if (!cancelled && data) setPresence(data);
      });
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [loadPresence]);

  if (!loading && !presence) return null;

  const activity =
    locale === "es" ? presence?.activityEs : presence?.activityEn;

  return (
    <div
      className={`w-full rounded-xl border backdrop-blur-sm ${scale.discordCard} ${className}`}
      style={{
        borderColor: hexToRgba(accentColor, 0.25),
        backgroundColor: hexToRgba(textColor, 0.06),
      }}
    >
      {loading ? (
        <div className="flex items-center gap-3 animate-pulse">
          <div
            className={`${compact ? "h-9 w-9" : "h-11 w-11"} shrink-0 rounded-full bg-white/10`}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-2.5 w-32 rounded bg-white/5" />
          </div>
        </div>
      ) : presence ? (
        <div className="flex items-center gap-3 text-left">
          <div className="relative shrink-0">
            <img
              src={
                presence.fallback
                  ? presence.avatarUrl
                  : proxiedDiscordAvatarUrl(presence.avatarUrl)
              }
              alt=""
              referrerPolicy="no-referrer"
              className={`${compact ? "h-9 w-9" : "h-11 w-11"} rounded-full object-cover bg-white/5`}
              draggable={false}
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[#0a0a0f] ${
                compact ? "h-3 w-3" : "h-3.5 w-3.5"
              }`}
              style={{ backgroundColor: presence.statusColor }}
              aria-hidden
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`${scale.discordName} truncate font-medium`}
              style={{ color: hexToRgba(textColor, 0.95) }}
            >
              {presence.displayName}
            </p>
            {activity ? (
              <p
                className={`${scale.discordActivity} truncate`}
                style={{ color: hexToRgba(textColor, 0.55) }}
              >
                {activity}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
