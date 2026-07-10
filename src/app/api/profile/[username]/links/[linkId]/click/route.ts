import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ username: string; linkId: string }>;
}

export async function POST(_request: Request, { params }: Props) {
  const { username, linkId } = await params;
  const normalizedUsername = username.toLowerCase();

  const link = await prisma.socialLink.findFirst({
    where: {
      id: linkId,
      user: { username: normalizedUsername },
    },
    select: { id: true },
  });

  if (!link) {
    return NextResponse.json({ error: "Enlace no encontrado" }, { status: 404 });
  }

  const updated = await prisma.socialLink.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } },
    select: { clicks: true },
  });

  return NextResponse.json({ clicks: updated.clicks });
}
