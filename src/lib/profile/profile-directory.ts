import { prisma } from "@/lib/prisma";
import { USER_ROLE_ADMIN } from "@/lib/roles";

export type ProfileDirectorySort = "views" | "recent" | "name";

export type ProfileDirectoryEntry = {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  views: number;
  createdAt: string;
};

export type ProfileDirectoryResult = {
  profiles: ProfileDirectoryEntry[];
  total: number;
};

function avatarForUser(username: string, avatarUrl: string | null): string {
  return (
    avatarUrl?.trim() ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
  );
}

export async function listPublicProfiles(options: {
  sort?: ProfileDirectorySort;
  limit?: number;
  offset?: number;
  search?: string;
  hideAdminProfiles?: boolean;
}): Promise<ProfileDirectoryResult> {
  const sort = options.sort ?? "views";
  const limit = Math.min(Math.max(options.limit ?? 48, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);
  const search = options.search?.trim();

  const where = {
    blockedAt: null,
    ...(options.hideAdminProfiles ? { role: { not: USER_ROLE_ADMIN } } : {}),
    ...(search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" as const } },
            { displayName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "views"
      ? { views: "desc" as const }
      : sort === "recent"
        ? { createdAt: "desc" as const }
        : { username: "asc" as const };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        views: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    total,
    profiles: rows.map((row) => ({
      username: row.username,
      displayName: row.displayName,
      avatarUrl: avatarForUser(row.username, row.avatarUrl),
      bio: row.bio,
      views: row.views,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}
