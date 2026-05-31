import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileToUpdateData, userToProfile } from "@/lib/profile-mapper";
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

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: profileToUpdateData(profile),
      include: { links: true },
    });

    return NextResponse.json(userToProfile(user));
  } catch {
    return NextResponse.json(
      { error: "Error al guardar el perfil" },
      { status: 500 }
    );
  }
}
