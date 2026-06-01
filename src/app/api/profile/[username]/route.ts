import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userToProfile } from "@/lib/profile-mapper";
import {
  profileUnlockCookieName,
  verifyProfileUnlockToken,
} from "@/lib/profile-access";
import { LockedPublicProfile } from "@/types/public-profile";

interface Props {
  params: Promise<{ username: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { username } = await params;
  const normalizedUsername = username.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    include: { links: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const session = await auth();
  const isOwner =
    session?.user?.id === user.id ||
    session?.user?.username?.toLowerCase() === normalizedUsername;

  if (!isOwner && user.accessCodeEnabled && user.accessCodeHash) {
    const cookieStore = await cookies();
    const unlockToken = cookieStore.get(profileUnlockCookieName(normalizedUsername))?.value;
    const unlocked = verifyProfileUnlockToken(unlockToken, user.id, normalizedUsername);

    if (!unlocked) {
      const locked: LockedPublicProfile = {
        locked: true,
        accessCodeRequired: true,
        username: user.username,
        displayName: user.displayName,
        avatarUrl:
          user.avatarUrl ??
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      };
      return NextResponse.json(locked);
    }
  }

  return NextResponse.json(userToProfile(user));
}
