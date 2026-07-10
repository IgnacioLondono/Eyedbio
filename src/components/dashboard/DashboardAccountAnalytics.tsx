"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
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

type LineSeries = {
  id: string;
  label: string;
  color: string;
  values: number[];
};

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

function LineChart({
  labels,
  series,
  height = 220,
}: {
  labels: string[];
  series: LineSeries[];
  height?: number;
}) {
  const gradId = useId().replace(/:/g, "");
  const width = 640;
  const pad = { top: 16, right: 16, bottom: 36, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxY = Math.max(...series.flatMap((s) => s.values), 1);
  const n = Math.max(labels.length - 1, 1);

  const pointsFor = (values: number[]) =>
    values
      .map((v, i) => {
        const x = pad.left + (i / n) * innerW;
        const y = pad.top + innerH - (v / maxY) * innerH;
        return `${x},${y}`;
      })
      .join(" ");

  const areaFor = (values: number[]) => {
    if (values.length === 0) return "";
    const pts = values.map((v, i) => {
      const x = pad.left + (i / n) * innerW;
      const y = pad.top + innerH - (v / maxY) * innerH;
      return [x, y] as const;
    });
    const first = pts[0];
    const last = pts[pts.length - 1];
    return [
      `M ${first[0]} ${pad.top + innerH}`,
      ...pts.map(([x, y]) => `L ${x} ${y}`),
      `L ${last[0]} ${pad.top + innerH}`,
      "Z",
    ].join(" ");
  };

  const yTicks = [0, 0.5, 1].map((t) => Math.round(maxY * t));

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="line chart"
      >
        {yTicks.map((tick) => {
          const y = pad.top + innerH - (tick / maxY) * innerH;
          return (
            <g key={`y-${tick}`}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              <text
                x={pad.left - 8}
                y={y + 3}
                textAnchor="end"
                fill="rgba(255,255,255,0.35)"
                fontSize="10"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {labels.map((label, i) => {
          if (labels.length > 8 && i % 2 !== 0 && i !== labels.length - 1) return null;
          const x = pad.left + (i / n) * innerW;
          return (
            <text
              key={`x-${label}-${i}`}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="10"
            >
              {label}
            </text>
          );
        })}

        {series.map((s, idx) => (
          <g key={s.id}>
            {idx === 0 ? (
              <>
                <defs>
                  <linearGradient id={`${gradId}-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaFor(s.values)} fill={`url(#${gradId}-${s.id})`} />
              </>
            ) : null}
            <polyline
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={pointsFor(s.values)}
            />
            {s.values.map((v, i) => {
              const x = pad.left + (i / n) * innerW;
              const y = pad.top + innerH - (v / maxY) * innerH;
              return (
                <circle
                  key={`${s.id}-dot-${i}`}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#0a0a10"
                  stroke={s.color}
                  strokeWidth="2"
                >
                  <title>{`${labels[i]} · ${s.label}: ${v}`}</title>
                </circle>
              );
            })}
          </g>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        {series.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 text-xs text-white/55">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompletenessBlock({ data }: { data: DashboardAnalytics }) {
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
  );
}

function LinkClicksList({
  links,
  limit,
}: {
  links: DashboardAnalytics["linkClicks"];
  limit?: number;
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
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
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

  const timelineLabels = useMemo(() => data.timeline.map((d) => d.label), [data.timeline]);
  const visitorsSeries = useMemo<LineSeries[]>(
    () => [
      {
        id: "total",
        label: t("dashboard.analytics.uniqueVisitors"),
        color: "#a855f7",
        values: data.timeline.map((d) => d.total),
      },
    ],
    [data.timeline, t]
  );
  const breakdownSeries = useMemo<LineSeries[]>(
    () => [
      {
        id: "loggedIn",
        label: t("dashboard.analytics.uniqueLoggedIn"),
        color: "#8b5cf6",
        values: data.timeline.map((d) => d.loggedIn),
      },
      {
        id: "guests",
        label: t("dashboard.analytics.uniqueGuests"),
        color: "#06b6d4",
        values: data.timeline.map((d) => d.guests),
      },
    ],
    [data.timeline, t]
  );
  const linkSeries = useMemo<LineSeries[]>(() => {
    const top = data.linkClicks.slice(0, 8);
    return [
      {
        id: "clicks",
        label: t("dashboard.analytics.linkClicks"),
        color: "#ec4899",
        values: top.map((l) => l.clicks),
      },
    ];
  }, [data.linkClicks, t]);
  const linkLabels = useMemo(
    () => data.linkClicks.slice(0, 8).map((l) => l.label.slice(0, 10)),
    [data.linkClicks]
  );

  if (sub === "summary") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
            label={t("dashboard.analytics.linkClicks")}
            value={fmt(data.summary.totalLinkClicks)}
            icon={MousePointerClick}
          />
          <StatCard
            label={t("dashboard.analytics.newVisitors3d")}
            value={fmt(data.summary.newVisitorsLast3Days)}
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <DashboardSection title={t("dashboard.analytics.visitorsTrend14d")} icon={TrendingUp} accent>
            <LineChart labels={timelineLabels} series={visitorsSeries} />
            <p className="mt-2 text-xs text-white/35">{t("dashboard.analytics.timelineHint")}</p>
          </DashboardSection>

          <DashboardSection title={t("dashboard.analytics.profileAnalysis")} icon={CheckCircle2}>
            <CompletenessBlock data={data} />
          </DashboardSection>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardSection title={t("dashboard.analytics.visitorBreakdown")} icon={Users}>
            <LineChart labels={timelineLabels} series={breakdownSeries} height={200} />
          </DashboardSection>
          <DashboardSection title={t("dashboard.analytics.summaryTopLinks")} icon={MousePointerClick}>
            <LinkClicksList links={data.linkClicks} limit={4} />
          </DashboardSection>
        </div>
      </div>
    );
  }

  if (sub === "analysis") {
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

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardSection title={t("dashboard.analytics.profileAnalysis")} icon={CheckCircle2}>
            <CompletenessBlock data={data} />
          </DashboardSection>
          <DashboardSection title={t("dashboard.analytics.visitorsTrend14d")} icon={TrendingUp}>
            <LineChart labels={timelineLabels} series={visitorsSeries} height={200} />
          </DashboardSection>
        </div>
      </div>
    );
  }

  if (sub === "visits") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
            label={t("dashboard.analytics.newVisitors3d")}
            value={fmt(data.visits.newLast3Days)}
            icon={TrendingUp}
          />
          <StatCard
            label={t("dashboard.analytics.newVisitors7d")}
            value={fmt(data.visits.newLast7Days)}
            icon={TrendingUp}
          />
        </div>

        <DashboardSection title={t("dashboard.analytics.trafficTrend")} icon={TrendingUp} accent>
          <LineChart labels={timelineLabels} series={visitorsSeries} />
          <p className="mt-2 text-xs text-white/35">{t("dashboard.analytics.timelineHint")}</p>
        </DashboardSection>

        <DashboardSection title={t("dashboard.analytics.visitorBreakdown")} icon={Users}>
          <LineChart labels={timelineLabels} series={breakdownSeries} />
          <div className="mt-4 grid grid-cols-2 gap-3">
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
            icon={Star}
          />
        </div>

        {linkLabels.length > 0 ? (
          <DashboardSection title={t("dashboard.analytics.clicksByLinkTrend")} icon={TrendingUp} accent>
            <LineChart labels={linkLabels} series={linkSeries} />
          </DashboardSection>
        ) : null}

        <DashboardSection title={t("dashboard.analytics.linksSection")} icon={Link2}>
          <LinkClicksList links={data.linkClicks} />
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
