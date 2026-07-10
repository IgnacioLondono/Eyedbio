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
  TrendingUp,
  Users,
} from "lucide-react";
import type { DashboardAnalytics } from "@/lib/dashboard/profile-analytics";
import { useI18n } from "@/components/providers/LocaleProvider";
import { DashboardSection } from "@/components/dashboard/DashboardUi";
import { PlatformIcon } from "@/components/shared/PlatformIcons";
import { PLATFORM_CONFIG } from "@/lib/config/platforms";
import type { SocialPlatform } from "@/types/profile";

export type AccountSub = "summary" | "analysis" | "visits" | "links" | "settings";

const ACCOUNT_SUB_LABEL_KEYS: Record<AccountSub, string> = {
  summary: "dashboard.accountSub.summary",
  analysis: "dashboard.accountSub.analysis",
  visits: "dashboard.accountSub.visits",
  links: "dashboard.accountSub.linkClicks",
  settings: "dashboard.accountSub.settings",
};

export function accountSubLabelKey(sub: AccountSub): string {
  return ACCOUNT_SUB_LABEL_KEYS[sub];
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-purple-500/25 bg-purple-500/10"
          : "border-white/[0.08] bg-[#12121a]"
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-white/45">
        <Icon className={`h-4 w-4 ${accent ? "text-purple-300" : ""}`} />
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-2xl font-semibold ${accent ? "text-purple-100" : "text-white"}`}>
        {value}
      </p>
      {sub ? <p className="mt-1 text-[11px] text-white/35">{sub}</p> : null}
    </div>
  );
}

function HorizontalBarChart({
  items,
  maxValue,
  heightClass = "h-2.5",
  tallBars = false,
}: {
  items: { label: string; value: number; color?: string }[];
  maxValue?: number;
  heightClass?: string;
  tallBars?: boolean;
}) {
  const max = maxValue ?? Math.max(...items.map((item) => item.value), 1);
  const barHeight = tallBars ? "h-3" : heightClass;

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const width = Math.max((item.value / max) * 100, item.value > 0 ? 4 : 0);
        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-white/60">{item.label}</span>
              <span className="shrink-0 font-medium tabular-nums text-white">{item.value}</span>
            </div>
            <div className={`overflow-hidden rounded-full bg-white/10 ${barHeight}`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${width}%`,
                  background: item.color ?? "linear-gradient(90deg, #7c3aed, #a855f7)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StackedBar({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-white/10">
        {segments.map((segment) =>
          segment.value > 0 ? (
            <div
              key={segment.label}
              className="h-full transition-all duration-500"
              style={{
                width: `${(segment.value / total) * 100}%`,
                backgroundColor: segment.color,
              }}
              title={`${segment.label}: ${segment.value}`}
            />
          ) : null
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5 text-xs text-white/55">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: segment.color }}
            />
            <span>{segment.label}</span>
            <span className="font-medium tabular-nums text-white/80">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompletenessBlock({ data, showItemBars = false }: { data: DashboardAnalytics; showItemBars?: boolean }) {
  const { t, tVars } = useI18n();
  const done = data.completeness.items.filter((item) => item.done).length;
  const total = data.completeness.items.length;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-white/70">{t("dashboard.analytics.profileProgress")}</span>
          <span className="font-medium text-purple-300">{data.completeness.percent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-emerald-500 transition-all"
            style={{ width: `${data.completeness.percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-white/35">
          {tVars("dashboard.analytics.completenessDone", { done, total })}
        </p>
      </div>

      {showItemBars ? (
        <HorizontalBarChart
          heightClass="h-2"
          items={data.completeness.items.map((item) => ({
            label: t(item.labelKey),
            value: item.done ? 100 : 0,
            color: item.done ? "#34d399" : "#3f3f46",
          }))}
        />
      ) : (
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
      )}
    </div>
  );
}

function LinkClicksList({
  links,
  limit,
  tallBars = false,
}: {
  links: DashboardAnalytics["linkClicks"];
  limit?: number;
  tallBars?: boolean;
}) {
  const { t, tVars } = useI18n();
  const items = limit ? links.slice(0, limit) : links;

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 py-6 text-center text-sm text-white/40">
        {t("dashboard.analytics.noLinkClicks")}
      </p>
    );
  }

  const maxClicks = Math.max(...items.map((l) => l.clicks), 1);

  return (
    <div className="space-y-3">
      {items.map((link) => {
        const config = PLATFORM_CONFIG[link.platform as SocialPlatform];
        const width = `${Math.max((link.clicks / maxClicks) * 100, link.clicks > 0 ? 6 : 0)}%`;
        const barColor = config?.color ?? "#a855f7";

        return (
          <div
            key={link.id}
            className="rounded-xl border border-white/[0.08] bg-[#12121a] px-3 py-3"
          >
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]"
                  style={{ color: config?.color }}
                >
                  <PlatformIcon platform={link.platform as SocialPlatform} />
                </span>
                <div className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">{link.label}</span>
                  <p className="truncate text-[11px] text-white/35">{link.url}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-lg bg-purple-500/15 px-2 py-1 text-sm font-semibold tabular-nums text-purple-200">
                {tVars("dashboard.analytics.clickCount", { count: link.clicks })}
              </span>
            </div>
            <div
              className={`overflow-hidden rounded-full bg-white/10 ${tallBars ? "h-3" : "h-2"}`}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width, backgroundColor: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnalyticsBody({ sub, data }: { sub: AccountSub; data: DashboardAnalytics }) {
  const { t, tVars, locale } = useI18n();
  const fmt = (n: number) => n.toLocaleString(locale === "en" ? "en-US" : "es-ES");
  const ctr =
    data.summary.profileViews > 0
      ? ((data.summary.totalLinkClicks / data.summary.profileViews) * 100).toFixed(1)
      : "0";
  const avgClicks =
    data.summary.activeLinks > 0
      ? (data.summary.totalLinkClicks / data.summary.activeLinks).toFixed(1)
      : "0";

  if (sub === "summary") {
    return (
      <div className="space-y-4">
        <DashboardSection title={t("dashboard.analytics.summaryOverview")} icon={BarChart3} accent>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard
              label={t("dashboard.analytics.profileViews")}
              value={fmt(data.summary.profileViews)}
              icon={Eye}
              accent
            />
            <StatCard
              label={t("dashboard.analytics.uniqueVisitors")}
              value={fmt(data.summary.uniqueVisitors)}
              icon={Users}
            />
            <StatCard
              label={t("dashboard.analytics.newVisitors3d")}
              value={fmt(data.summary.newVisitorsLast3Days)}
              icon={TrendingUp}
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
        </DashboardSection>

        <DashboardSection title={t("dashboard.analytics.metricsComparison")} icon={BarChart3}>
          <HorizontalBarChart
            tallBars
            items={[
              {
                label: t("dashboard.analytics.profileViews"),
                value: data.summary.profileViews,
                color: "#a855f7",
              },
              {
                label: t("dashboard.analytics.uniqueVisitors"),
                value: data.summary.uniqueVisitors,
                color: "#6366f1",
              },
              {
                label: t("dashboard.analytics.linkClicks"),
                value: data.summary.totalLinkClicks,
                color: "#ec4899",
              },
              {
                label: t("dashboard.analytics.newVisitors3d"),
                value: data.summary.newVisitorsLast3Days,
                color: "#14b8a6",
              },
            ]}
          />
        </DashboardSection>

        <DashboardSection title={t("dashboard.analytics.profileAnalysis")} icon={CheckCircle2}>
          <CompletenessBlock data={data} />
        </DashboardSection>

        <DashboardSection title={t("dashboard.analytics.summaryTopLinks")} icon={MousePointerClick}>
          <LinkClicksList links={data.linkClicks} limit={3} tallBars />
        </DashboardSection>

        <DashboardSection title={t("dashboard.analytics.summaryVisitsSnapshot")} icon={Eye}>
          <StackedBar
            segments={[
              {
                label: t("dashboard.analytics.uniqueLoggedIn"),
                value: data.visits.uniqueLoggedIn,
                color: "#8b5cf6",
              },
              {
                label: t("dashboard.analytics.uniqueGuests"),
                value: data.visits.uniqueGuests,
                color: "#06b6d4",
              },
            ]}
          />
          <div className="mt-4">
            <HorizontalBarChart
              items={[
                {
                  label: t("dashboard.analytics.newVisitors3d"),
                  value: data.visits.newLast3Days,
                  color: "#a855f7",
                },
                {
                  label: t("dashboard.analytics.newVisitors7d"),
                  value: data.visits.newLast7Days,
                  color: "#22c55e",
                },
              ]}
            />
          </div>
        </DashboardSection>
      </div>
    );
  }

  if (sub === "analysis") {
    const done = data.completeness.items.filter((item) => item.done).length;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label={t("dashboard.analytics.profileProgress")}
            value={`${data.completeness.percent}%`}
            icon={CheckCircle2}
            accent
          />
          <StatCard
            label={t("dashboard.analytics.profileViews")}
            value={fmt(data.summary.profileViews)}
            icon={Eye}
          />
          <StatCard
            label={t("dashboard.analytics.activeLinks")}
            value={fmt(data.summary.activeLinks)}
            icon={Link2}
          />
        </div>

        <DashboardSection title={t("dashboard.analytics.profileAnalysis")} icon={BarChart3}>
          <CompletenessBlock data={data} showItemBars />
        </DashboardSection>

        <DashboardSection title={t("dashboard.analytics.completenessChart")} icon={CheckCircle2}>
          <p className="mb-3 text-xs text-white/40">
            {tVars("dashboard.analytics.completenessDone", {
              done,
              total: data.completeness.items.length,
            })}
          </p>
          <HorizontalBarChart
            heightClass="h-3"
            items={data.completeness.items.map((item) => ({
              label: t(item.labelKey),
              value: item.done ? 1 : 0,
              color: item.done ? "#34d399" : "#52525b",
            }))}
            maxValue={1}
          />
        </DashboardSection>
      </div>
    );
  }

  if (sub === "visits") {
    return (
      <div className="space-y-4">
        <DashboardSection title={t("dashboard.analytics.visitsSection")} icon={Eye} accent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard
              label={t("dashboard.analytics.totalViews")}
              value={fmt(data.visits.total)}
              icon={Eye}
              accent
            />
            <StatCard
              label={t("dashboard.analytics.uniqueVisitors")}
              value={fmt(data.summary.uniqueVisitors)}
              icon={Users}
            />
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
          </div>
        </DashboardSection>

        <DashboardSection title={t("dashboard.analytics.visitorBreakdown")} icon={Users}>
          <StackedBar
            segments={[
              {
                label: t("dashboard.analytics.uniqueLoggedIn"),
                value: data.visits.uniqueLoggedIn,
                color: "#8b5cf6",
              },
              {
                label: t("dashboard.analytics.uniqueGuests"),
                value: data.visits.uniqueGuests,
                color: "#06b6d4",
              },
            ]}
          />
        </DashboardSection>

        <DashboardSection title={t("dashboard.analytics.trafficTrend")} icon={TrendingUp}>
          <HorizontalBarChart
            tallBars
            items={[
              {
                label: t("dashboard.analytics.totalViews"),
                value: data.visits.total,
                color: "#a855f7",
              },
              {
                label: t("dashboard.analytics.uniqueVisitors"),
                value: data.summary.uniqueVisitors,
                color: "#6366f1",
              },
              {
                label: t("dashboard.analytics.newVisitors3d"),
                value: data.visits.newLast3Days,
                color: "#f59e0b",
              },
              {
                label: t("dashboard.analytics.newVisitors7d"),
                value: data.visits.newLast7Days,
                color: "#22c55e",
              },
            ]}
          />
          <p className="mt-4 text-xs text-white/35">{t("dashboard.analytics.visitsHint")}</p>
        </DashboardSection>
      </div>
    );
  }

  if (sub === "links") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label={t("dashboard.analytics.linkClicks")}
            value={fmt(data.summary.totalLinkClicks)}
            icon={MousePointerClick}
            accent
          />
          <StatCard
            label={t("dashboard.analytics.activeLinks")}
            value={fmt(data.summary.activeLinks)}
            icon={Link2}
          />
          <StatCard
            label={t("dashboard.analytics.clickThroughRate")}
            value={`${ctr}%`}
            icon={TrendingUp}
            sub={tVars("dashboard.analytics.clickCount", {
              count: data.summary.totalLinkClicks,
            })}
          />
          <StatCard
            label={t("dashboard.analytics.avgClicksPerLink")}
            value={avgClicks}
            icon={BarChart3}
          />
        </div>

        <DashboardSection title={t("dashboard.analytics.metricsComparison")} icon={BarChart3}>
          <HorizontalBarChart
            tallBars
            items={data.linkClicks.map((link) => ({
              label: link.label,
              value: link.clicks,
              color: PLATFORM_CONFIG[link.platform as SocialPlatform]?.color ?? "#a855f7",
            }))}
          />
        </DashboardSection>

        <DashboardSection title={t("dashboard.analytics.linksSection")} icon={Link2}>
          <LinkClicksList links={data.linkClicks} tallBars />
        </DashboardSection>
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
