import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { requireAdminApi } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { AdminUserRow } from "@/types/admin";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const q = searchParams.get("q")?.trim() ?? "";

  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  try {
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
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
        },
      }),
    ]);

    const rows: AdminUserRow[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      views: user.views,
      blockedAt: user.blockedAt?.toISOString() ?? null,
      blockedReason: user.blockedReason,
      createdAt: user.createdAt.toISOString(),
    }));

    return NextResponse.json({
      users: rows,
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar los usuarios" }, { status: 500 });
  }
}
