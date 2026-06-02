import type { SocialLink } from "@/types/profile";

/** Máximo de enlaces sociales activos (con URL) por perfil. */
export const MAX_SOCIAL_LINKS = 7;

export function countActiveSocialLinks(links: Pick<SocialLink, "url">[]): number {
  return links.filter((link) => link.url.trim().length > 0).length;
}

export function countDraftSocialLinks(links: Pick<SocialLink, "url">[]): number {
  return links.filter((link) => !link.url.trim()).length;
}

/** ¿Se puede añadir otro enlace? Solo cuentan los que tienen URL. */
export function canAddSocialLink(links: Pick<SocialLink, "url">[]): boolean {
  const active = countActiveSocialLinks(links);
  if (active >= MAX_SOCIAL_LINKS) return false;
  if (links.length < MAX_SOCIAL_LINKS) return true;
  return links.some((link) => !link.url.trim());
}

export function validateSocialLinksCount(links: Pick<SocialLink, "url">[]): string | null {
  const active = countActiveSocialLinks(links);
  if (active > MAX_SOCIAL_LINKS) {
    return `Solo puedes tener hasta ${MAX_SOCIAL_LINKS} enlaces en tu perfil.`;
  }
  if (links.length > MAX_SOCIAL_LINKS) {
    return `Solo puedes tener hasta ${MAX_SOCIAL_LINKS} espacios de enlace. Elimina uno sin URL o borra un enlace.`;
  }
  return null;
}
