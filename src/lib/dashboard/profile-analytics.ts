import { prisma } from "@/lib/prisma";
import { PLATFORM_CONFIG } from "@/lib/config/platforms";
import { isSocialLinkActive } from "@/lib/social-link-utils";
import type { Profile } from "@/types/profile";

export type ProfileCompletenessItem = {
  id: string;
  labelKey: string;
  done: boolean;
};

export type DashboardAnalytics = {
  summary: {
    profileViews: number;
    uniqueVisitors: number;
    newVisitorsLast3Days: number;
    totalLinkClicks: number;
    activeLinks: number;
    reviewsCount: number;
  };
  completeness: {
    percent: number;
    items: ProfileCompletenessItem[];
  };
  visits: {
    total: number;
    uniqueLoggedIn: number;
    uniqueGuests: number;
    newLast3Days: number;
    newLast7Days: number;
  };
  linkClicks: {
    id: string;
    platform: string;
    label: string;
    url: string;
    clicks: number;
  }[];
};

function isDefaultAvatar(url: string, username: string): boolean {
  return url.includes("dicebear.com") || url.includes(`seed=${username}`);
}

export function computeProfileCompleteness(profile: Profile): {
  percent: number;
  items: ProfileCompletenessItem[];
} {
  const items: ProfileCompletenessItem[] = [
    {
      id: "avatar",
      labelKey: "dashboard.analytics.checkAvatar",
      done: Boolean(profile.avatarUrl) && !isDefaultAvatar(profile.avatarUrl, profile.username),
    },
    {
      id: "bio",
      labelKey: "dashboard.analytics.checkBio",
      done: profile.bio.trim().length > 0,
    },
    {
      id: "links",
      labelKey: "dashboard.analytics.checkLinks",
      done: profile.links.some((link) => isSocialLinkActive(link)),
    },
    {
      id: "background",
      labelKey: "dashboard.analytics.checkBackground",
      done: Boolean(profile.settings.backgroundUrl?.trim()),
    },
    {
      id: "discord",
      labelKey: "dashboard.analytics.checkDiscord",
      done: Boolean(profile.settings.discordUserId?.trim()),
    },
  ];

  const done = items.filter((item) => item.done).length;
  const percent = Math.round((done / items.length) * 100);
  return { percent, items };
}

export async function fetchDashboardAnalytics(
  userId: string,
  profile: Profile
): Promise<DashboardAnalytics> {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    uniqueLoggedIn,
    uniqueGuests,
    newGuests3d,
    newGuests7d,
    newLoggedIn3d,
    newLoggedIn7d,
    reviewsCount,
    dbLinks,
  ] = await Promise.all([
    prisma.profileView.count({ where: { profileUserId: userId } }),
    prisma.profileViewGuest.count({ where: { profileUserId: userId } }),
    prisma.profileViewGuest.count({
      where: { profileUserId: userId, createdAt: { gte: threeDaysAgo } },
    }),
    prisma.profileViewGuest.count({
      where: { profileUserId: userId, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.profileView.count({
      where: { profileUserId: userId, createdAt: { gte: threeDaysAgo } },
    }),
    prisma.profileView.count({
      where: { profileUserId: userId, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.profileReview.count({ where: { profileUserId: userId } }),
    prisma.socialLink.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, platform: true, url: true, label: true, clicks: true, archived: true },
    }),
  ]);

  const uniqueVisitors = uniqueLoggedIn + uniqueGuests;
  const newVisitorsLast3Days = newGuests3d + newLoggedIn3d;
  const totalLinkClicks = dbLinks.reduce((sum, link) => sum + link.clicks, 0);
  const activeLinks = profile.links.filter((link) => isSocialLinkActive(link)).length;
  const completeness = computeProfileCompleteness(profile);

  const linkClicks = dbLinks
    .filter((link) => !link.archived && link.url.trim().length > 0)
    .map((link) => {
      const config = PLATFORM_CONFIG[link.platform as keyof typeof PLATFORM_CONFIG];
      return {
        id: link.id,
        platform: link.platform,
        label: link.label?.trim() || config?.label || link.platform,
        url: link.url,
        clicks: link.clicks,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);

  return {
    summary: {
      profileViews: profile.views,
      uniqueVisitors,
      newVisitorsLast3Days,
      totalLinkClicks,
      activeLinks,
      reviewsCount,
    },
    completeness,
    visits: {
      total: profile.views,
      uniqueLoggedIn,
      uniqueGuests,
      newLast3Days: newVisitorsLast3Days,
      newLast7Days: newGuests7d + newLoggedIn7d,
    },
    linkClicks,
  };
}
