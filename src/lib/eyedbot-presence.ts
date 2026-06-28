import type { LanyardApiResponse, LanyardPresence } from "@/lib/lanyard";
import { isValidDiscordUserId } from "@/lib/lanyard";

/** Base URL del endpoint de presencia de EyedBot (sin barra final). */
export const DEFAULT_EYEDBOT_PRESENCE_URL = "https://eyedbot.eyedcomun.me/api/presence";

export function isEyedBotPresenceConfigured(): boolean {
  return Boolean(process.env.EYEDBOT_API_KEY?.trim());
}

export function getEyedBotPresenceBaseUrl(): string {
  const base = process.env.EYEDBOT_PRESENCE_URL?.trim() || DEFAULT_EYEDBOT_PRESENCE_URL;
  return base.replace(/\/$/, "");
}

export async function fetchEyedBotPresence(userId: string): Promise<LanyardPresence | null> {
  const apiKey = process.env.EYEDBOT_API_KEY?.trim();
  if (!apiKey) return null;

  const id = userId.trim();
  if (!isValidDiscordUserId(id)) return null;

  const res = await fetch(`${getEyedBotPresenceBaseUrl()}/${id}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const body = (await res.json()) as LanyardApiResponse;
  if (!body.success || !body.data) return null;

  return body.data;
}
