import { unstable_cache } from "next/cache";
import { findProfileByUsername, ProfileUserWithLinks } from "@/lib/profile/profile-query";

export type CachedProfileUser = ProfileUserWithLinks;

export function profileCacheTag(username: string): string {
  return `profile-${username.toLowerCase()}`;
}

/**
 * Caché solo para lecturas no críticas (OG, etc.).
 * No usar para decidir si un perfil existe en la API pública.
 */
export function getCachedProfileUser(username: string): Promise<CachedProfileUser | null> {
  const normalized = username.toLowerCase();

  return unstable_cache(
    async () => findProfileByUsername(normalized),
    [`profile-user-${normalized}`],
    {
      revalidate: 60,
      tags: [profileCacheTag(normalized)],
    }
  )();
}
