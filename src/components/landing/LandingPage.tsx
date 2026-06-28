"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  BarChart3,
  Palette,
  Link2,
  Shield,
  Zap,
  Users,
  Eye,
  Upload,
  Compass,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import CommunityDiscordLink from "@/components/layout/CommunityDiscordLink";
import LandingStyleShowcase from "@/components/landing/LandingStyleShowcase";
import LandingGunsShowcase from "@/components/landing/LandingGunsShowcase";
import { useI18n } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n";

type StatsResponse = {
  formatted: {
    users: string;
    profileViews: string;
    uploads: string;
    links: string;
  };
  users: number;
};

export default function LandingPage() {
  const { status } = useSession();
  const { locale, t, tVars } = useI18n();
  const m = getMessages(locale).landing;
  const isLoggedIn = status === "authenticated";
  const [stats, setStats] = useState<StatsResponse["formatted"] | null>(null);
  const [userCount, setUserCount] = useState(0);

  const statConfig = [
    { key: "profileViews" as const, label: m.statsProfileViews, icon: Eye },
    { key: "users" as const, label: m.statsUsers, icon: Users },
    { key: "uploads" as const, label: m.statsUploads, icon: Upload },
    { key: "links" as const, label: m.statsLinks, icon: Link2 },
  ];

  const featureIcons = [Link2, Palette, Sparkles, BarChart3, Shield, Zap];

  useEffect(() => {
    fetch("/api/stats")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.formatted) {
          throw new Error("Stats unavailable");
        }
        return data as StatsResponse;
      })
      .then((data) => {
        setStats(data.formatted);
        setUserCount(data.users);
      })
      .catch(() => {
        setStats({ users: "0", profileViews: "0", uploads: "0", links: "0" });
        setUserCount(0);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <Navbar showCommunityLink />

      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              {m.heroBadge}
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              {m.heroTitle}{" "}
              <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                {m.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              {m.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5"
                >
                  {m.goDashboard}
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5"
                  >
                    {m.signupFree}
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-3.5 text-base font-medium border border-white/10 rounded-xl hover:bg-white/5 transition-all hover:-translate-y-0.5"
                  >
                    {t("nav.login")}
                  </Link>
                </>
              )}
            </div>

            <div className="inline-flex items-center gap-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <span className="px-4 py-3 text-white/40 text-sm font-mono">eyed.bio/</span>
              <input
                type="text"
                placeholder={m.usernamePlaceholder}
                className="bg-transparent px-2 py-3 text-white placeholder-white/30 outline-none w-40 font-mono text-sm"
                onChange={(e) => {
                  e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) window.location.href = `/signup?username=${encodeURIComponent(val)}`;
                  }
                }}
              />
              <Link
                href="/signup"
                className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-sm font-medium transition-colors"
              >
                {m.claim}
              </Link>
            </div>
          </motion.div>

          <LandingGunsShowcase />
        </div>
      </section>

      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {statConfig.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                {stats ? stats[stat.key] : "—"}
              </div>
              <div className="text-white/40 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="hidden py-16 px-6 border-y border-white/5" aria-hidden>
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-5">
            <Compass className="w-6 h-6 text-purple-300" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {m.profilesTitle}{" "}
            <span className="text-purple-400">{m.profilesTitleHighlight}</span>
          </h2>
          <p className="text-white/50 text-sm md:text-base mb-6">{m.exploreProfilesCta}</p>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25"
          >
            {m.exploreProfilesButton}
          </Link>
        </div>
      </section>

      <div className="hidden" aria-hidden>
        <LandingStyleShowcase />
      </div>

      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {m.featuresTitle}{" "}
              <span className="text-purple-400">{m.featuresTitleHighlight}</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">{m.featuresSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {m.features.map((f, i) => {
              const Icon = featureIcons[i] ?? Sparkles;
              return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.05] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            );
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{m.faqTitle}</h2>
          <div className="space-y-4">
            {m.faqs.map((faq) => (
              <details
                key={faq.q}
                className="group p-5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
              >
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-purple-400 group-open:rotate-45 transition-transform text-xl">
                    +
                  </span>
                </summary>
                <p className="text-white/50 text-sm mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CommunityDiscordLink variant="banner" />

      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{m.ctaTitle}</h2>
          <p className="text-white/50 mb-8">
            {userCount > 0
              ? tVars("landing.ctaJoin", { count: stats?.users ?? String(userCount) })
              : m.ctaFirst}
          </p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="inline-block px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all shadow-xl shadow-purple-500/30"
          >
            {isLoggedIn ? m.ctaButtonLoggedIn : m.ctaButtonGuest}
          </Link>
        </div>
      </section>
    </div>
  );
}
