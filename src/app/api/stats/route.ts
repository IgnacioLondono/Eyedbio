import { NextResponse } from "next/server";
import { formatStat, getPlatformStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getPlatformStats();

    return NextResponse.json({
      users: stats.users,
      profileViews: stats.profileViews,
      uploads: stats.uploads,
      links: stats.links,
      formatted: {
        users: formatStat(stats.users),
        profileViews: formatStat(stats.profileViews),
        uploads: formatStat(stats.uploads),
        links: formatStat(stats.links),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar las estadísticas" },
      { status: 500 }
    );
  }
}
