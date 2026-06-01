import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { isAdminRole, USER_ROLE_ADMIN } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      role: true,
      views: true,
      blockedAt: true,
      blockedReason: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { links: true, reviewsReceived: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
    blockedAt: user.blockedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    linksCount: user._count.links,
    reviewsCount: user._count.reviewsReceived,
  });
}

export async function PATCH(request: Request, { params }: Props) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;

  if (id === guard.admin.id) {
    return NextResponse.json({ error: "No puedes modificar tu propia cuenta admin" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!target) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (isAdminRole(target.role)) {
    return NextResponse.json({ error: "No puedes bloquear a otro administrador" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "block") {
      const reason =
        typeof body.reason === "string" && body.reason.trim()
          ? body.reason.trim().slice(0, 500)
          : null;

      const updated = await prisma.user.update({
        where: { id },
        data: {
          blockedAt: new Date(),
          blockedReason: reason,
        },
        select: {
          id: true,
          blockedAt: true,
          blockedReason: true,
        },
      });

      return NextResponse.json({
        message: "Cuenta bloqueada",
        user: {
          ...updated,
          blockedAt: updated.blockedAt?.toISOString() ?? null,
        },
      });
    }

    if (action === "unblock") {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          blockedAt: null,
          blockedReason: null,
        },
        select: {
          id: true,
          blockedAt: true,
          blockedReason: true,
        },
      });

      return NextResponse.json({
        message: "Cuenta desbloqueada",
        user: {
          ...updated,
          blockedAt: null,
        },
      });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el usuario" }, { status: 500 });
  }
}
