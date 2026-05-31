import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ username: string }>;
}

export async function POST(_request: Request, { params }: Props) {
  const { username } = await params;

  const user = await prisma.user.update({
    where: { username: username.toLowerCase() },
    data: { views: { increment: 1 } },
    select: { views: true },
  }).catch(() => null);

  if (!user) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ views: user.views });
}
