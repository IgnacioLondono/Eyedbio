/** Máximo de enlaces sociales por perfil. */
export const MAX_SOCIAL_LINKS = 7;

export function canAddSocialLink(currentCount: number): boolean {
  return currentCount < MAX_SOCIAL_LINKS;
}

export function validateSocialLinksCount(count: number): string | null {
  if (count > MAX_SOCIAL_LINKS) {
    return `Solo puedes tener hasta ${MAX_SOCIAL_LINKS} enlaces en tu perfil.`;
  }
  return null;
}
