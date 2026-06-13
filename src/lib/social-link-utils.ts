import { SocialLink, SocialPlatform } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/platforms";

/** Plataformas donde solo hay identificador (usuario), no URL clicable. */
export function isCopyOnlySocialLink(platform: SocialPlatform): boolean {
  return platform === "discord";
}

export function normalizeDiscordUsername(raw: string): string {
  let value = raw.trim().replace(/^@+/, "").replace(/\s+/g, "");
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return "";
  }

  return value;
}

export function formatDiscordUsername(raw: string): string {
  const user = normalizeDiscordUsername(raw);
  return user ? `@${user}` : "";
}

export function sanitizeSocialLinkInput(platform: SocialPlatform, raw: string): string {
  if (platform === "discord") return normalizeDiscordUsername(raw);
  return raw;
}

export function getSocialLinkHref(link: SocialLink): string | undefined {
  if (isCopyOnlySocialLink(link.platform)) return undefined;
  const url = link.url.trim();
  return url || undefined;
}

export function getSocialLinkCopyValue(link: SocialLink): string | null {
  if (!isCopyOnlySocialLink(link.platform)) return null;
  const user = normalizeDiscordUsername(link.url);
  return user || null;
}

export function getSocialLinkTitle(link: SocialLink): string {
  const config = PLATFORM_CONFIG[link.platform];
  if (link.label?.trim()) return link.label.trim();
  if (link.platform === "discord") {
    const formatted = formatDiscordUsername(link.url);
    if (formatted) return formatted;
  }
  return config.label;
}

export function isSocialLinkActive(link: Pick<SocialLink, "url" | "platform">): boolean {
  if (isCopyOnlySocialLink(link.platform)) {
    return normalizeDiscordUsername(link.url).length > 0;
  }
  return link.url.trim().length > 0;
}
