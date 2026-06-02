import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { findProfileByUsername } from "@/lib/profile-query";
import { userToProfile } from "@/lib/profile-mapper";
import { ensureUserPublicUid } from "@/lib/public-uid";
import {
  profileUnlockCookieName,
  verifyProfileUnlockToken,
} from "@/lib/profile-access";
import { PROFILE_UNLOCK_HEADER } from "@/lib/profile-unlock-client";
import { LockedPublicProfile } from "@/types/public-profile";

interface Props {
  params: Promise<{ username: string }>;
}

export async function GET(request: Request, { params }: Props) {
  const { username } = await params;
  const normalizedUsername = username.toLowerCase();

  let user;
  try {
    user = await findProfileByUsername(normalizedUsername);
  } catch (err) {
    console.error("[profile GET]", normalizedUsername, err);
    return NextResponse.json(
      { error: "Error al cargar el perfil. Inténtalo de nuevo." },
      { status: 503 }
    );
  }

  if (!user) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  if (!user.publicUid) {
    user.publicUid = await ensureUserPublicUid(user.id);
  }

  const session = await auth();
  const isOwner =
    session?.user?.id === user.id ||
    session?.user?.username?.toLowerCase() === normalizedUsername;

  if (!isOwner && user.accessCodeEnabled && user.accessCodeHash) {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(profileUnlockCookieName(normalizedUsername))?.value;
    const headerToken = request.headers.get(PROFILE_UNLOCK_HEADER) ?? undefined;
    const unlockToken = cookieToken ?? headerToken;
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
