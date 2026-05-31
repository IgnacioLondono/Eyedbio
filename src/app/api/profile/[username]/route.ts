import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userToProfile } from "@/lib/profile-mapper";

interface Props {
  params: Promise<{ username: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: { links: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  return NextResponse.json(userToProfile(user));
}
