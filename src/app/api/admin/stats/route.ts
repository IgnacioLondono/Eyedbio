import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { USER_ROLE_ADMIN } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { countOpenSupportTickets } from "@/lib/support";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const [users, blockedUsers, admins, viewsAgg, links, openSupportTickets] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { blockedAt: { not: null } } }),
      prisma.user.count({ where: { role: USER_ROLE_ADMIN } }),
      prisma.user.aggregate({ _sum: { views: true } }),
      prisma.socialLink.count(),
      countOpenSupportTickets().catch(() => 0),
    ]);

    return NextResponse.json({
      users,
      blockedUsers,
      admins,
      profileViews: viewsAgg._sum.views ?? 0,
      links,
      openSupportTickets,
    });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar las estadísticas" }, { status: 500 });
  }
}
