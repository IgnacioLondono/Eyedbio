"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Eye,
  Link2,
  MousePointerClick,
  Star,
  Users,
} from "lucide-react";
import type { DashboardAnalytics } from "@/lib/dashboard/profile-analytics";
import { useI18n } from "@/components/providers/LocaleProvider";
import { DashboardSection } from "@/components/dashboard/DashboardUi";
import { PlatformIcon } from "@/components/shared/PlatformIcons";
import { PLATFORM_CONFIG } from "@/lib/config/platforms";
import type { SocialPlatform } from "@/types/profile";

export type AccountSub = "summary" | "analysis" | "visits" | "links" | "settings";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#12121a] p-4">
      <div className="mb-2 flex items-center gap-2 text-white/45">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function AnalyticsBody({ sub, data }: { sub: AccountSub; data: DashboardAnalytics }) {
  const { t, tVars, locale } = useI18n();
  const fmt = (n: number) => n.toLocaleString(locale === "en" ? "en-US" : "es-ES");

  if (sub === "summary") {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label={t("dashboard.analytics.profileViews")} value={fmt(data.summary.profileViews)} icon={Eye} />
        <StatCard
          label={t("dashboard.analytics.uniqueVisitors")}
          value={fmt(data.summary.uniqueVisitors)}
          icon={Users}
        />
        <StatCard
          label={t("dashboard.analytics.newVisitors3d")}
          value={fmt(data.summary.newVisitorsLast3Days)}
          icon={BarChart3}
        />
        <StatCard
          label={t("dashboard.analytics.linkClicks")}
          value={fmt(data.summary.totalLinkClicks)}
          icon={MousePointerClick}
        />
        <StatCard
          label={t("dashboard.analytics.activeLinks")}
          value={fmt(data.summary.activeLinks)}
          icon={Link2}
        />
        <StatCard
          label={t("dashboard.analytics.reviews")}
          value={fmt(data.summary.reviewsCount)}
          icon={Star}
        />
      </div>
    );
  }

  if (sub === "analysis") {
    return (
      <DashboardSection title={t("dashboard.analytics.profileAnalysis")} icon={BarChart3}>
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-white/70">{t("dashboard.analytics.profileProgress")}</span>
              <span className="font-medium text-purple-300">{data.completeness.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-purple-500 transition-all"
                style={{ width: `${data.completeness.percent}%` }}
              />
            </div>
          </div>
          <ul className="space-y-2">
            {data.completeness.items.map((item) => (
              <li
                key={item.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  item.done ? "bg-emerald-500/10 text-emerald-200/90" : "bg-white/[0.03] text-white/55"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-white/25" />
                )}
                {t(item.labelKey)}
              </li>
            ))}
          </ul>
        </div>
      </DashboardSection>
    );
  }

  if (sub === "visits") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard label={t("dashboard.analytics.totalViews")} value={fmt(data.visits.total)} icon={Eye} />
        <StatCard
          label={t("dashboard.analytics.uniqueLoggedIn")}
          value={fmt(data.visits.uniqueLoggedIn)}
          icon={Users}
        />
        <StatCard
          label={t("dashboard.analytics.uniqueGuests")}
          value={fmt(data.visits.uniqueGuests)}
          icon={Users}
        />
        <StatCard
          label={t("dashboard.analytics.newVisitors3d")}
          value={fmt(data.visits.newLast3Days)}
          icon={BarChart3}
        />
        <StatCard
          label={t("dashboard.analytics.newVisitors7d")}
          value={fmt(data.visits.newLast7Days)}
          icon={BarChart3}
        />
        <p className="sm:col-span-2 text-xs text-white/35">{t("dashboard.analytics.visitsHint")}</p>
      </div>
    );
  }

  if (sub === "links") {
    if (data.linkClicks.length === 0) {
      return (
        <p className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-white/40">
          {t("dashboard.analytics.noLinkClicks")}
        </p>
      );
    }

    const maxClicks = Math.max(...data.linkClicks.map((l) => l.clicks), 1);

    return (
      <div className="space-y-2">
        {data.linkClicks.map((link) => {
          const config = PLATFORM_CONFIG[link.platform as SocialPlatform];
          const width = `${Math.max((link.clicks / maxClicks) * 100, link.clicks > 0 ? 8 : 0)}%`;
          return (
            <div
              key={link.id}
              className="rounded-xl border border-white/[0.08] bg-[#12121a] px-3 py-2.5"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span style={{ color: config?.color }}>
                    <PlatformIcon platform={link.platform as SocialPlatform} />
                  </span>
                  <span className="truncate text-sm font-medium text-white">{link.label}</span>
                </div>
                <span className="shrink-0 text-sm text-white/70">
                  {tVars("dashboard.analytics.clickCount", { count: link.clicks })}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-purple-500/80" style={{ width }} />
              </div>
              <p className="mt-1.5 truncate text-[11px] text-white/35">{link.url}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

export default function DashboardAccountAnalytics({ sub }: { sub: AccountSub }) {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sub === "settings") return;
    setLoading(true);
    fetch("/api/dashboard/analytics")
      .then(async (res) => {
        if (!res.ok) throw new Error("Error");
        return res.json() as Promise<DashboardAnalytics>;
      })
      .then(setData)
      .catch(() => setError(t("dashboard.analytics.loadError")))
      .finally(() => setLoading(false));
  }, [sub, t]);

  if (sub === "settings") return null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-sm text-red-400">{error || t("dashboard.analytics.loadError")}</p>;
  }

  return <AnalyticsBody sub={sub} data={data} />;
}
