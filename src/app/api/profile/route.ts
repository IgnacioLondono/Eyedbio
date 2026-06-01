import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { profileCacheTag } from "@/lib/cached-profile";
import { prisma } from "@/lib/prisma";
import { validateSocialLinksCount } from "@/lib/links-config";
import { saveUserProfile } from "@/lib/profile-save";
import { userToProfile } from "@/lib/profile-mapper";
import { Profile } from "@/types/profile";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

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

    revalidateTag(profileCacheTag(result.profile.username), "max");

    return NextResponse.json(result.profile);
  } catch {
    return NextResponse.json(
      { error: "Error al guardar el perfil" },
      { status: 500 }
    );
  }
}
