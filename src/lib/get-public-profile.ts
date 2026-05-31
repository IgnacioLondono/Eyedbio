import { prisma } from "@/lib/prisma";
import { userToProfile } from "@/lib/profile-mapper";
import { Profile } from "@/types/profile";

export async function getPublicProfile(username: string): Promise<Profile | null> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: { links: true },
  });

  if (!user) return null;
  return userToProfile(user);
}
