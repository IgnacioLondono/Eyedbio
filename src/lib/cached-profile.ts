import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SocialLink, User } from "@/generated/prisma/client";

export type CachedProfileUser = User & { links: SocialLink[] };

export function profileCacheTag(username: string): string {
  return `profile-${username.toLowerCase()}`;
}

export function getCachedProfileUser(username: string): Promise<CachedProfileUser | null> {
  const normalized = username.toLowerCase();

  return unstable_cache(
    async () =>
      prisma.user.findUnique({
        where: { username: normalized },
        include: { links: true },
      }),
    [`profile-user-${normalized}`],
    {
      revalidate: 60,
      tags: [profileCacheTag(normalized)],
    }
  )();
}
