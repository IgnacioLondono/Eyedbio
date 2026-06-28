import { createHmac, timingSafeEqual } from "crypto";
import { packDiscordLinkState, unpackDiscordLinkState } from "@/lib/auth/discord-link-intent";
import { absoluteUrl } from "@/lib/config/site-url";

const DEFAULT_PANEL_URL = "https://eyedbot.eyedcomun.me";
const DEFAULT_LINK_START_PATH = "/api/link/eyedbio";

/** Callback de Discord OAuth registrado en la app del bot (informativo). */
export const EYEDBOT_DISCORD_CALLBACK_URL = "https://eyedbot.eyedcomun.me/callback";

export function isEyedBotLinkAvailable(): boolean {
  return Boolean(process.env.EYEDBOT_API_KEY?.trim());
}

export function getEyedBotPanelUrl(): string {
  return (process.env.EYEDBOT_PANEL_URL?.trim() || DEFAULT_PANEL_URL).replace(/\/$/, "");
}

function getEyedBotLinkStartPath(): string {
  const path = process.env.EYEDBOT_LINK_START_PATH?.trim() || DEFAULT_LINK_START_PATH;
  return path.startsWith("/") ? path : `/${path}`;
}

export function buildEyedBotLinkStartUrl(userId: string): string | null {
  if (!isEyedBotLinkAvailable()) return null;

  const returnUrl = absoluteUrl("/api/account/discord/eyedbot-callback");
  const state = packDiscordLinkState(userId);

  const url = new URL(getEyedBotLinkStartPath(), `${getEyedBotPanelUrl()}/`);
  url.searchParams.set("returnUrl", returnUrl);
  url.searchParams.set("state", state);
  return url.toString();
}

export function signEyedBotLinkPayload(discordUserId: string, state: string): string {
  const key = process.env.EYEDBOT_API_KEY!.trim();
  return createHmac("sha256", key).update(`${discordUserId}.${state}`).digest("hex");
}

export function verifyEyedBotLinkPayload(
  discordUserId: string,
  state: string,
  sig: string
): boolean {
  const key = process.env.EYEDBOT_API_KEY?.trim();
  if (!key || !discordUserId || !state || !sig) return false;

  const expected = signEyedBotLinkPayload(discordUserId, state);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function parseEyedBotLinkCallback(params: {
  discordUserId: string | null;
  state: string | null;
  sig: string | null;
}): { userId: string; discordUserId: string } | null {
  const discordUserId = params.discordUserId?.trim() ?? "";
  const state = params.state?.trim() ?? "";
  const sig = params.sig?.trim() ?? "";

  if (!discordUserId || !state || !sig) return null;
  if (!verifyEyedBotLinkPayload(discordUserId, state, sig)) return null;

  const userId = unpackDiscordLinkState(state);
  if (!userId) return null;

  return { userId, discordUserId };
}
