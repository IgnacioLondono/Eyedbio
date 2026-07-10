import { SocialLink, SocialPlatform } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/config/platforms";

const COPY_ONLY_PLATFORMS = new Set<SocialPlatform>(["discord", "epicgames"]);

/** Plataformas donde solo hay identificador (usuario), no URL clicable. */
export function isCopyOnlySocialLink(platform: SocialPlatform): boolean {
  return COPY_ONLY_PLATFORMS.has(platform);
}

export function isPlatformUsernameField(platform: SocialPlatform): boolean {
  return isCopyOnlySocialLink(platform);
}

export function normalizePlatformUsername(raw: string): string {
  let value = raw.trim().replace(/^@+/, "").replace(/\s+/g, "");
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return "";
  return value;
}

export function formatPlatformUsername(platform: SocialPlatform, raw: string): string {
  const user = normalizePlatformUsername(raw);
  if (!user) return "";
  return platform === "discord" ? `@${user}` : user;
}

export function sanitizeSocialLinkInput(platform: SocialPlatform, raw: string): string {
  if (isCopyOnlySocialLink(platform)) return normalizePlatformUsername(raw);
  return raw;
}

export function getSocialLinkHref(link: SocialLink): string | undefined {
  if (isCopyOnlySocialLink(link.platform)) return undefined;
  const url = link.url.trim();
  return url || undefined;
}

/** URL lista para abrir en nueva pestaña (añade https si falta). */
export function resolveExternalHref(href: string): string {
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

/** Texto amigable para el modal de confirmación (sin protocolo). */
export function getExternalLinkDisplayUrl(href: string): string {
  try {
    const url = new URL(resolveExternalHref(href));
    const path =
      url.pathname === "/" || url.pathname === ""
        ? "/"
        : url.pathname.endsWith("/")
          ? url.pathname
          : `${url.pathname}/`;
    return `${url.hostname}${path === "/" ? "/" : path}`;
  } catch {
    return href.replace(/^https?:\/\//i, "").replace(/^\/*/, "") || href;
  }
}

export function getSocialLinkCopyValue(link: SocialLink): string | null {
  if (!isCopyOnlySocialLink(link.platform)) return null;
  const user = normalizePlatformUsername(link.url);
  return user || null;
}

export function getSocialLinkTitle(link: SocialLink): string {
  const config = PLATFORM_CONFIG[link.platform];
  if (link.label?.trim()) return link.label.trim();
  if (isCopyOnlySocialLink(link.platform)) {
    const formatted = formatPlatformUsername(link.platform, link.url);
    if (formatted) return formatted;
  }
  return config.label;
}

export function isSocialLinkActive(link: Pick<SocialLink, "url" | "platform">): boolean {
  if (isCopyOnlySocialLink(link.platform)) {
    return normalizePlatformUsername(link.url).length > 0;
  }
  return link.url.trim().length > 0;
}
