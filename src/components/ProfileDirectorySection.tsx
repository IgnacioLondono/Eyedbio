"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Crown, Eye, Search, Sparkles, Users, X } from "lucide-react";
import { useI18n } from "@/components/LocaleProvider";
import { getMessages } from "@/lib/i18n";
import type { ProfileDirectoryEntry, ProfileDirectorySort } from "@/lib/profile-directory";

type DirectoryResponse = {
  profiles: ProfileDirectoryEntry[];
  total: number;
};

const TABS: { id: ProfileDirectorySort; icon: typeof Crown }[] = [
  { id: "views", icon: Crown },
  { id: "recent", icon: Sparkles },
  { id: "name", icon: Users },
];

const TOP_LIMIT = 3;
const PAGE_SIZE = 24;

function parseSort(value: string | null): ProfileDirectorySort {
  if (value === "recent" || value === "name" || value === "views") return value;
  return "views";
}

function limitForSort(sort: ProfileDirectorySort): number {
  return sort === "views" ? TOP_LIMIT : PAGE_SIZE;
}

function buildDiscoverHref(sort: ProfileDirectorySort, search?: string): string {
  const params = new URLSearchParams();
  params.set("sort", sort);
  const q = search?.trim();
  if (q) params.set("q", q);
  return `/discover?${params.toString()}`;
}

interface Props {
  variant?: "page" | "embedded";
}

function ProfileCard({
  profile,
  locale,
  viewsLabel,
  rank,
  compact = false,
}: {
  profile: ProfileDirectoryEntry;
  locale: string;
  viewsLabel: string;
  rank?: number;
  compact?: boolean;
}) {
  const rankStyles =
    rank === 1
      ? "bg-amber-500/25 text-amber-200 border-amber-400/30"
      : rank === 2
        ? "bg-slate-400/20 text-slate-100 border-slate-300/25"
        : rank === 3
          ? "bg-orange-700/25 text-orange-200 border-orange-500/30"
          : "";

  return (
    <Link
      href={`/${profile.username}`}
      className={`group block h-full rounded-2xl border bg-white/[0.03] hover:border-purple-500/30 hover:bg-white/[0.05] transition-all ${
        compact ? "p-3" : "p-4"
      } ${rank ? "border-white/12" : "border-white/8"}`}
    >
      <div className="flex items-start gap-3">
        <img
          src={profile.avatarUrl}
          alt=""
          className={`rounded-full object-cover shrink-0 ring-2 ring-white/10 group-hover:ring-purple-500/40 transition-all ${
            compact ? "w-10 h-10" : "w-12 h-12"
          }`}
          draggable={false}
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold truncate group-hover:text-purple-200 transition-colors ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {profile.displayName}
          </p>
          <p className="text-[11px] text-white/40 truncate">@{profile.username}</p>
        </div>
        {rank ? (
          <span
            className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${rankStyles}`}
          >
            #{rank}
          </span>
        ) : null}
      </div>
      {!compact && profile.bio.trim() ? (
        <p className="mt-3 text-xs text-white/45 line-clamp-2 leading-relaxed">{profile.bio}</p>
      ) : null}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/35">
        <Eye className="w-3.5 h-3.5" />
        <span>
          {profile.views.toLocaleString(locale === "en" ? "en-US" : "es-ES")} {viewsLabel}
        </span>
      </div>
    </Link>
  );
}

function TopPodium({
  profiles,
  locale,
  viewsLabel,
  topRankLabel,
}: {
  profiles: ProfileDirectoryEntry[];
  locale: string;
  viewsLabel: string;
  topRankLabel: (rank: number) => string;
}) {
  const ordered = [
    profiles[1] ? { profile: profiles[1], rank: 2 as const } : null,
    profiles[0] ? { profile: profiles[0], rank: 1 as const } : null,
    profiles[2] ? { profile: profiles[2], rank: 3 as const } : null,
  ].filter(Boolean) as { profile: ProfileDirectoryEntry; rank: 1 | 2 | 3 }[];

  const podiumHeight = (rank: 1 | 2 | 3) =>
    rank === 1 ? "min-h-[220px]" : rank === 2 ? "min-h-[190px]" : "min-h-[170px]";

  const avatarSize = (rank: 1 | 2 | 3) =>
    rank === 1 ? "w-20 h-20" : rank === 2 ? "w-16 h-16" : "w-14 h-14";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end max-w-3xl mx-auto">
      {ordered.map(({ profile, rank }) => (
        <motion.div
          key={profile.username}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rank === 1 ? 0.05 : rank === 2 ? 0 : 0.1 }}
          className={rank === 1 ? "sm:order-2" : rank === 2 ? "sm:order-1" : "sm:order-3"}
        >
          <Link
            href={`/${profile.username}`}
            className={`group flex flex-col items-center text-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 hover:border-purple-500/35 transition-all ${podiumHeight(rank)}`}
          >
            <span
              className={`mb-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                rank === 1
                  ? "bg-amber-500/20 text-amber-200 border-amber-400/30"
                  : rank === 2
                    ? "bg-slate-400/20 text-slate-100 border-slate-300/25"
                    : "bg-orange-700/25 text-orange-200 border-orange-500/30"
              }`}
            >
              {topRankLabel(rank)}
            </span>
            <img
              src={profile.avatarUrl}
              alt=""
              className={`${avatarSize(rank)} rounded-full object-cover ring-4 ring-white/10 group-hover:ring-purple-500/40 transition-all mb-3`}
              draggable={false}
              referrerPolicy="no-referrer"
            />
            <p className="font-semibold text-sm truncate max-w-full group-hover:text-purple-200 transition-colors">
              {profile.displayName}
            </p>
            <p className="text-[11px] text-white/40 truncate max-w-full">@{profile.username}</p>
            <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs text-white/45">
              <Eye className="w-3.5 h-3.5" />
              <span>
                {profile.views.toLocaleString(locale === "en" ? "en-US" : "es-ES")} {viewsLabel}
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function ProfileDirectoryContent({ variant = "embedded" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, tVars } = useI18n();
  const m = getMessages(locale).landing;
  const syncUrl = variant === "page";

  const sort = parseSort(searchParams.get("sort"));
  const searchQuery = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [profiles, setProfiles] = useState<ProfileDirectoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!syncUrl || searchParams.get("sort")) return;
    router.replace(buildDiscoverHref("views"), { scroll: false });
  }, [router, searchParams, syncUrl]);

  const tabHint = useMemo(() => {
    if (sort === "views") return m.profilesTabTopHint;
    if (sort === "recent") return m.profilesTabRecentHint;
    return m.profilesTabAllHint;
  }, [m, sort]);

  const fetchProfiles = useCallback(
    async (options: {
      nextSort: ProfileDirectorySort;
      nextSearch: string;
      offset: number;
      append: boolean;
    }) => {
      const { nextSort, nextSearch, offset, append } = options;
      const limit = limitForSort(nextSort);
      const params = new URLSearchParams({
        sort: nextSort,
        limit: String(limit),
        offset: String(offset),
      });
      if (nextSearch.trim()) params.set("q", nextSearch.trim());

      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await fetch(`/api/profiles/directory?${params.toString()}`);
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as DirectoryResponse;
        setProfiles((prev) => (append ? [...prev, ...data.profiles] : data.profiles));
        setTotal(data.total);
      } catch {
        if (!append) {
          setProfiles([]);
          setTotal(0);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchProfiles({ nextSort: sort, nextSearch: searchQuery, offset: 0, append: false });
  }, [fetchProfiles, sort, searchQuery]);

  const applySearch = () => {
    if (!syncUrl) return;
    router.replace(buildDiscoverHref("name", searchInput), { scroll: false });
  };

  const clearSearch = () => {
    if (!syncUrl) return;
    setSearchInput("");
    router.replace(buildDiscoverHref("name"), { scroll: false });
  };

  const canLoadMore = sort !== "views" && profiles.length < total;
  const isPage = variant === "page";
  const topRankLabel = (rank: number) => tVars("landing.profilesTopRank", { rank });

  return (
    <section
      id={isPage ? undefined : "profiles"}
      className={isPage ? "py-8 px-6" : "py-20 px-6 border-y border-white/5"}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`text-center ${isPage ? "mb-8" : "mb-10"}`}>
          <h1
            className={`font-bold mb-3 ${
              isPage ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
            }`}
          >
            {m.profilesTitle}{" "}
            <span className="text-purple-400">{m.profilesTitleHighlight}</span>
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base">
            {m.profilesSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {TABS.map(({ id, icon: Icon }) => {
            const active = sort === id;
            const className = `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              active
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                : "bg-white/[0.04] text-white/60 border border-white/10 hover:text-white hover:bg-white/[0.07]"
            }`;

            const label =
              id === "views"
                ? m.profilesTabTop
                : id === "recent"
                  ? m.profilesTabRecent
                  : m.profilesTabAll;

            if (syncUrl) {
              const href = buildDiscoverHref(id, id === "name" ? searchQuery : undefined);
              const isCurrent = sort === id;

              return (
                <Link
                  key={id}
                  href={href}
                  scroll={false}
                  onClick={(event) => {
                    if (isCurrent) {
                      event.preventDefault();
                      return;
                    }
                    event.preventDefault();
                    router.push(href);
                  }}
                  className={className}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            }

            return (
              <button key={id} type="button" className={className} disabled={active}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-white/40 mb-6">{tabHint}</p>

        {sort === "name" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              applySearch();
            }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-white/35 pointer-events-none" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={m.profilesSearchPlaceholder}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
                  aria-label={getMessages(locale).common.close}
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </form>
        ) : null}

        {total > 0 && sort !== "views" ? (
          <p className="text-center text-xs text-white/35 mb-6">
            {tVars("landing.profilesShowingCount", { shown: profiles.length, total })}
          </p>
        ) : null}

        {loading ? (
          <div
            className={
              sort === "views"
                ? "grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
                : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            }
          >
            {Array.from({ length: sort === "views" ? 3 : 8 }).map((_, index) => (
              <div
                key={index}
                className={`rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse ${
                  sort === "views" ? "h-52" : "h-44"
                }`}
              />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-center text-white/45 text-sm py-12">
            {searchQuery.trim() ? m.profilesNoResults : m.profilesEmpty}
          </p>
        ) : sort === "views" ? (
          <TopPodium
            profiles={profiles.slice(0, TOP_LIMIT)}
            locale={locale}
            viewsLabel={m.profilesViewsLabel}
            topRankLabel={topRankLabel}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profiles.map((profile, index) => (
                <motion.div
                  key={profile.username}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.03, 0.24) }}
                >
                  <ProfileCard
                    profile={profile}
                    locale={locale}
                    viewsLabel={m.profilesViewsLabel}
                  />
                </motion.div>
              ))}
            </div>
            {canLoadMore ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() =>
                    void fetchProfiles({
                      nextSort: sort,
                      nextSearch: searchQuery,
                      offset: profiles.length,
                      append: true,
                    })
                  }
                  className="px-6 py-2.5 rounded-xl text-sm font-medium bg-white/[0.05] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08] disabled:opacity-50 transition-colors"
                >
                  {loadingMore ? getMessages(locale).common.loading : m.profilesLoadMore}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

export default function ProfileDirectorySection(props: Props) {
  return <ProfileDirectoryContent {...props} />;
}
