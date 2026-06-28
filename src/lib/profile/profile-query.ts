import { prisma } from "@/lib/prisma";
import { SocialLink, User } from "@/generated/prisma/client";

export type ProfileUserWithLinks = User & { links: SocialLink[] };

/** Lectura directa de BD (sin caché). Usar en APIs y rutas que deben ser exactas. */
export function findProfileByUsername(username: string): Promise<ProfileUserWithLinks | null> {
  return prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: { links: true },
  });
}
