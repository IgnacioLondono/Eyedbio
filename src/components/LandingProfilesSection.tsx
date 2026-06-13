"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, Eye, Sparkles, Users } from "lucide-react";
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

export default function LandingProfilesSection() {
  const { locale, tVars } = useI18n();
  const m = getMessages(locale).landing;
  const [sort, setSort] = useState<ProfileDirectorySort>("views");
  const [profiles, setProfiles] = useState<ProfileDirectoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProfiles = useCallback(async (nextSort: ProfileDirectorySort) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profiles/directory?sort=${nextSort}&limit=48`);
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as DirectoryResponse;
      setProfiles(data.profiles);
      setTotal(data.total);
    } catch {
      setProfiles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfiles(sort);
  }, [loadProfiles, sort]);

  const tabLabel = (id: ProfileDirectorySort) => {
    if (id === "views") return m.profilesTabTop;
    if (id === "recent") return m.profilesTabRecent;
    return m.profilesTabAll;
  };

  return (
    <section id="profiles" className="py-20 px-6 border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            {m.profilesTitle}{" "}
            <span className="text-purple-400">{m.profilesTitleHighlight}</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base">
            {m.profilesSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {TABS.map(({ id, icon: Icon }) => {
            const active = sort === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSort(id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white/[0.04] text-white/60 border border-white/10 hover:text-white hover:bg-white/[0.07]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tabLabel(id)}
              </button>
            );
          })}
          {total > 0 ? (
            <span className="text-xs text-white/35 ml-1">
              {tVars("landing.profilesCount", { count: total })}
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-44 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-center text-white/45 text-sm py-12">{m.profilesEmpty}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile.username}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(index * 0.03, 0.24) }}
              >
                <Link
                  href={`/${profile.username}`}
                  className="group block h-full rounded-2xl border border-white/8 bg-white/[0.03] p-4 hover:border-purple-500/30 hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-white/10 group-hover:ring-purple-500/40 transition-all"
                      draggable={false}
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate group-hover:text-purple-200 transition-colors">
                        {profile.displayName}
                      </p>
                      <p className="text-[11px] text-white/40 truncate">@{profile.username}</p>
                    </div>
                    {sort === "views" && index < 3 ? (
                      <span
                        className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          index === 0
                            ? "bg-amber-500/20 text-amber-300"
                            : index === 1
                              ? "bg-slate-400/20 text-slate-200"
                              : "bg-orange-700/25 text-orange-200"
                        }`}
                      >
                        #{index + 1}
                      </span>
                    ) : null}
                  </div>
                  {profile.bio.trim() ? (
                    <p className="mt-3 text-xs text-white/45 line-clamp-2 leading-relaxed">
                      {profile.bio}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/35">
                    <Eye className="w-3.5 h-3.5" />
                    <span>
                      {profile.views.toLocaleString(locale === "en" ? "en-US" : "es-ES")}{" "}
                      {m.profilesViewsLabel}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
