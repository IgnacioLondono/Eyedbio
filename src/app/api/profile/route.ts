import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserBlocked } from "@/lib/auth-user";
import { safeRevalidateTag } from "@/lib/cache-utils";
import { prisma } from "@/lib/prisma";
import { profileCacheTag } from "@/lib/cached-profile";
import { validateSocialLinksCount } from "@/lib/links-config";
import { saveUserProfile } from "@/lib/profile-save";
import { userToProfile } from "@/lib/profile-mapper";
import { Profile } from "@/types/profile";

async function rejectIfBlocked(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { blockedAt: true },
  });
  if (!user || isUserBlocked(user)) {
    return NextResponse.json(
      { error: "Tu cuenta está bloqueada. Contacta con soporte." },
      { status: 403 }
    );
  }
  return null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const blocked = await rejectIfBlocked(session.user.id);
  if (blocked) return blocked;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { links: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json(userToProfile(user));
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const blocked = await rejectIfBlocked(session.user.id);
  if (blocked) return blocked;

  try {
    const profile = (await request.json()) as Profile;

    const linksError = validateSocialLinksCount(profile.links?.length ?? 0);
    if (linksError) {
      return NextResponse.json({ error: linksError }, { status: 400 });
    }

    const result = await saveUserProfile(
      session.user.id,
      profile,
      profile.updatedAt
    );

    if (!result.ok) {
      if (result.conflict) {
        return NextResponse.json(
          {
            error:
              "El perfil cambió en otra pestaña o dispositivo. Recarga y vuelve a guardar.",
            code: "PROFILE_CONFLICT",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    safeRevalidateTag(profileCacheTag(result.profile.username));

    return NextResponse.json(result.profile);
  } catch {
    return NextResponse.json(
      { error: "Error al guardar el perfil" },
      { status: 500 }
    );
  }
}
