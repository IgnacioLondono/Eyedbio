import type { SocialLink, SocialPlatform } from "@/types/profile";
import { isSocialLinkActive } from "@/lib/social-link-utils";

/** Máximo de enlaces activos (con URL) en el perfil. */
export const MAX_PROFILE_LINKS = 12;

/** Máximo de redes / plataformas predefinidas (no custom). */
export const MAX_PLATFORM_LINKS = 7;

/** Máximo de URLs personalizadas (proyectos web, portfolios, etc.). */
export const MAX_CUSTOM_LINKS = 5;

/** @deprecated Usa MAX_PROFILE_LINKS */
export const MAX_SOCIAL_LINKS = MAX_PROFILE_LINKS;

type LinkRow = Pick<SocialLink, "url" | "platform">;

export function countActiveSocialLinks(links: Pick<SocialLink, "url" | "platform">[]): number {
  return links.filter(isSocialLinkActive).length;
}

export function countActiveCustomLinks(links: LinkRow[]): number {
  return links.filter(
    (link) => link.platform === "custom" && link.url.trim().length > 0
  ).length;
}

export function countActivePlatformLinks(links: LinkRow[]): number {
  return links.filter(
    (link) => link.platform !== "custom" && link.url.trim().length > 0
  ).length;
}

export function countDraftSocialLinks(links: Pick<SocialLink, "url" | "platform">[]): number {
  return links.filter((link) => !isSocialLinkActive(link)).length;
}

function hasDraftSlot(links: Pick<SocialLink, "url" | "platform">[]): boolean {
  return links.some((link) => !isSocialLinkActive(link));
}

/** ¿Hay hueco para otro enlace (cualquier tipo)? */
export function canAddSocialLink(links: Pick<SocialLink, "url" | "platform">[]): boolean {
  const active = countActiveSocialLinks(links);
  if (active >= MAX_PROFILE_LINKS) return false;
  if (links.length < MAX_PROFILE_LINKS) return true;
  return hasDraftSlot(links);
}

export function canAddCustomLink(links: LinkRow[]): boolean {
  if (!canAddSocialLink(links)) return false;
  return countActiveCustomLinks(links) < MAX_CUSTOM_LINKS;
}

export function canAddPlatformLink(links: LinkRow[]): boolean {
  if (!canAddSocialLink(links)) return false;
  return countActivePlatformLinks(links) < MAX_PLATFORM_LINKS;
}

export function canAddLink(links: LinkRow[], platform: SocialPlatform): boolean {
  if (platform === "custom") return canAddCustomLink(links);
  return canAddPlatformLink(links);
}

export function validateSocialLinksCount(links: LinkRow[]): string | null {
  const active = countActiveSocialLinks(links);
  const custom = countActiveCustomLinks(links);
  const platforms = countActivePlatformLinks(links);

  if (active > MAX_PROFILE_LINKS) {
    return `Solo puedes tener hasta ${MAX_PROFILE_LINKS} enlaces en tu perfil.`;
  }
  if (custom > MAX_CUSTOM_LINKS) {
    return `Solo puedes tener hasta ${MAX_CUSTOM_LINKS} URLs personalizadas.`;
  }
  if (platforms > MAX_PLATFORM_LINKS) {
    return `Solo puedes tener hasta ${MAX_PLATFORM_LINKS} enlaces de redes o plataformas.`;
  }
  if (links.length > MAX_PROFILE_LINKS) {
    return `Solo puedes tener hasta ${MAX_PROFILE_LINKS} espacios de enlace. Elimina uno sin URL o borra un enlace.`;
  }
  return null;
}
