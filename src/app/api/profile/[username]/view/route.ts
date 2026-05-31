import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ username: string }>;
}

export async function POST(_request: Request, { params }: Props) {
  const { username } = await params;
  const normalizedUsername = username.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    select: { id: true, views: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const session = await auth();
  const isOwner =
    session?.user?.id === existing.id ||
    session?.user?.username?.toLowerCase() === normalizedUsername;

  if (isOwner) {
    return NextResponse.json({ views: existing.views, skipped: true });
  }

  const user = await prisma.user.update({
    where: { username: normalizedUsername },
    data: { views: { increment: 1 } },
    select: { views: true },
  });

  return NextResponse.json({ views: user.views });
}
