import { unstable_cache } from "next/cache";
import { readdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

const STATS_REVALIDATE_SECONDS = 300;

async function countFiles(dir: string): Promise<number> {
  let count = 0;

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        count += await countFiles(fullPath);
      } else if (entry.isFile()) {
        count += 1;
      }
    }
  } catch {
    return 0;
  }

  return count;
}

async function fetchPlatformStats() {
  const [users, viewsAgg, links, uploads] = await Promise.all([
    prisma.user.count(),
    prisma.user.aggregate({ _sum: { views: true } }),
    prisma.socialLink.count(),
    countFiles(UPLOAD_ROOT),
  ]);

  return {
    users,
    profileViews: viewsAgg._sum.views ?? 0,
    uploads,
    links,
  };
}

const getCachedPlatformStats = unstable_cache(
  fetchPlatformStats,
  ["platform-stats"],
  { revalidate: STATS_REVALIDATE_SECONDS, tags: ["platform-stats"] }
);

export async function getPlatformStats() {
  return getCachedPlatformStats();
}

export function formatStat(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${m >= 10 ? Math.floor(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 10_000) {
    return `${Math.floor(value / 1_000)}K`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString("es-ES");
}
