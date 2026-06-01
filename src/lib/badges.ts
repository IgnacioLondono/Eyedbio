import { CheckCircle, Crown, Sparkles, Star, type LucideIcon } from "lucide-react";

export const MANAGED_BADGES = ["verified", "owner"] as const;
export type ManagedBadge = (typeof MANAGED_BADGES)[number];

export const BADGE_CONFIG: Record<
  string,
  { icon: LucideIcon; color: string; labelKey: "verified" | "owner" | "premium" | "og" }
> = {
  owner: { icon: Crown, color: "#fbbf24", labelKey: "owner" },
  verified: { icon: CheckCircle, color: "#3b82f6", labelKey: "verified" },
  premium: { icon: Sparkles, color: "#f59e0b", labelKey: "premium" },
  og: { icon: Star, color: "#a855f7", labelKey: "og" },
};

export function parseBadgesJson(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((b) => typeof b === "string") : [];
  } catch {
    return [];
  }
}

export function toggleBadgeList(badges: string[], badge: string): string[] {
  return badges.includes(badge) ? badges.filter((b) => b !== badge) : [...badges, badge];
}
