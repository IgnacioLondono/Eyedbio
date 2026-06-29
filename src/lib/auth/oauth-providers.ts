import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import Twitch from "next-auth/providers/twitch";

export type OAuthProviderId = "google" | "discord" | "github" | "twitch";

export const OAUTH_PROVIDER_IDS: OAuthProviderId[] = [
  "google",
  "discord",
  "github",
  "twitch",
];

function isConfigured(id: string, clientIdKey: string, clientSecretKey: string): boolean {
  return Boolean(process.env[clientIdKey]?.trim() && process.env[clientSecretKey]?.trim());
}

/** Kill switch global: OAUTH_ENABLED=off oculta botones y desactiva proveedores OAuth. */
export function isOAuthGloballyEnabled(): boolean {
  const flag = process.env.OAUTH_ENABLED?.trim().toLowerCase();
  if (flag === "off" || flag === "false" || flag === "0" || flag === "no") return false;
  return true;
}

export function getEnabledOAuthProviderIds(): OAuthProviderId[] {
  if (!isOAuthGloballyEnabled()) return [];

  const enabled: OAuthProviderId[] = [];

  if (isConfigured("google", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET")) {
    enabled.push("google");
  }
  if (isConfigured("discord", "DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET")) {
    enabled.push("discord");
  }
  if (isConfigured("github", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET")) {
    enabled.push("github");
  }
  if (isConfigured("twitch", "TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET")) {
    enabled.push("twitch");
  }

  return enabled;
}

/** Aplica toggles del sitio (p. ej. ocultar Discord en login). */
export function filterOAuthProvidersForSite(
  providerIds: OAuthProviderId[],
  site: { discordLoginEnabled?: boolean }
): OAuthProviderId[] {
  if (site.discordLoginEnabled === false) {
    return providerIds.filter((id) => id !== "discord");
  }
  return providerIds;
}

export async function getPublicOAuthProviderIds(): Promise<OAuthProviderId[]> {
  const { getSiteSettings } = await import("@/lib/site-settings");
  const site = await getSiteSettings();
  return filterOAuthProvidersForSite(getEnabledOAuthProviderIds(), site);
}

export function buildOAuthProviders(): Provider[] {
  if (!isOAuthGloballyEnabled()) return [];

  const providers: Provider[] = [];

  if (isConfigured("google", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET")) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  if (isConfigured("discord", "DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET")) {
    providers.push(
      Discord({
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  if (isConfigured("github", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET")) {
    providers.push(
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
        authorization: { params: { scope: "read:user user:email" } },
      })
    );
  }

  if (isConfigured("twitch", "TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET")) {
    providers.push(
      Twitch({
        clientId: process.env.TWITCH_CLIENT_ID!,
        clientSecret: process.env.TWITCH_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
        authorization: { params: { scope: "openid user:read:email" } },
      })
    );
  }

  return providers;
}
