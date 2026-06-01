import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { USER_ROLE_ADMIN } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const [users, blockedUsers, admins, viewsAgg, links] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { blockedAt: { not: null } } }),
      prisma.user.count({ where: { role: USER_ROLE_ADMIN } }),
      prisma.user.aggregate({ _sum: { views: true } }),
      prisma.socialLink.count(),
    ]);

    return NextResponse.json({
      users,
      blockedUsers,
      admins,
      profileViews: viewsAgg._sum.views ?? 0,
      links,
    });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar las estadísticas" }, { status: 500 });
  }
}
