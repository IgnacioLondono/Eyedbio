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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Logo from "@/components/layout/Logo";
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
    <div className="relative min-h-screen bg-[#07070b] text-white overflow-x-hidden">
      {/* Fondo global: rejilla sutil + halos */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
        <div className="absolute -top-40 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-purple-600/25 blur-[140px]" />
        <div className="absolute top-1/3 -left-32 h-[420px] w-[420px] rounded-full bg-violet-500/15 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[460px] w-[460px] rounded-full bg-fuchsia-500/10 blur-[150px]" />
      </div>

      <div className="relative z-10">
        <Navbar showCommunityLink />

        {/* HERO */}
        <section className="relative px-6 pt-36 pb-16">
          <div className="mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-200 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-400" />
                </span>
                {m.heroBadge}
              </div>

              <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
                {m.heroTitle}{" "}
                <span className="relative whitespace-nowrap bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  {m.heroTitleHighlight}
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/55 md:text-xl">
                {m.heroSubtitle}
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-3.5 text-base font-semibold shadow-xl shadow-purple-500/30 transition-all hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500 hover:shadow-purple-500/50"
                  >
                    {m.goDashboard}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-3.5 text-base font-semibold shadow-xl shadow-purple-500/30 transition-all hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500 hover:shadow-purple-500/50"
                    >
                      {m.signupFree}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-xl border border-white/10 bg-white/[0.02] px-8 py-3.5 text-base font-medium transition-all hover:-translate-y-0.5 hover:bg-white/5"
                    >
                      {t("nav.login")}
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-8 inline-flex items-center overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 transition-colors focus-within:border-purple-500/40">
                <span className="py-3 pl-4 pr-1 font-mono text-sm text-white/40">
                  eyed.bio/
                </span>
                <input
                  type="text"
                  placeholder={m.usernamePlaceholder}
                  className="w-40 bg-transparent px-1 py-3 font-mono text-sm text-white placeholder-white/30 outline-none"
                  onChange={(e) => {
                    e.target.value = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, "");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val)
                        window.location.href = `/signup?username=${encodeURIComponent(val)}`;
                    }
                  }}
                />
                <Link
                  href="/signup"
                  className="bg-purple-600 px-5 py-3 text-sm font-medium transition-colors hover:bg-purple-500"
                >
                  {m.claim}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            >
              <LandingGunsShowcase />
            </motion.div>
          </div>
        </section>

        {/* STATS */}
        <section className="px-6 py-14">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
            {statConfig.map((stat, i) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center transition-all hover:border-purple-500/20 hover:bg-white/[0.04]"
              >
                <stat.icon className="mx-auto mb-3 h-5 w-5 text-purple-400" />
                <div className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                  {stats ? stats[stat.key] : "—"}
                </div>
                <div className="mt-1 text-sm text-white/40">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SHOWCASE DE ESTILOS */}
        <LandingStyleShowcase />

        {/* FEATURES */}
        <section id="features" className="px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                {m.featuresTitleHighlight}
              </span>
              <h2 className="text-3xl font-bold md:text-4xl">
                {m.featuresTitle}{" "}
                <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                  {m.featuresTitleHighlight}
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/50">
                {m.featuresSubtitle}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {m.features.map((f, i) => {
                const Icon = featureIcons[i] ?? Sparkles;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-purple-500/25 hover:bg-white/[0.04]"
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 ring-1 ring-purple-500/20 transition-colors group-hover:from-purple-500/30">
                      <Icon className="h-5 w-5 text-purple-300" />
                    </div>
                    <h3 className="mb-2 font-semibold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-white/45">
                      {f.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DESCUBRIR */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-950/40 via-white/[0.02] to-transparent p-10 text-center md:p-14">
              <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-purple-600/20 blur-3xl" />
              <div className="relative">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
                  <Compass className="h-6 w-6 text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold md:text-3xl">
                  {m.profilesTitle}{" "}
                  <span className="text-purple-400">
                    {m.profilesTitleHighlight}
                  </span>
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-white/50 md:text-base">
                  {m.exploreProfilesCta}
                </p>
                <Link
                  href="/discover"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500"
                >
                  {m.exploreProfilesButton}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              {m.faqTitle}
            </h2>
            <div className="space-y-3">
              {m.faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-colors open:border-purple-500/20 open:bg-white/[0.04] hover:border-white/10"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                    {faq.q}
                    <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-lg text-purple-400 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <CommunityDiscordLink variant="banner" />

        {/* CTA FINAL */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-600/20 via-violet-600/10 to-transparent p-12 text-center md:p-16">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-48 w-[420px] -translate-x-1/2 rounded-full bg-purple-500/25 blur-[100px]" />
              </div>
              <div className="relative">
                <h2 className="text-3xl font-bold md:text-4xl">{m.ctaTitle}</h2>
                <p className="mx-auto mt-4 max-w-md text-white/55">
                  {userCount > 0
                    ? tVars("landing.ctaJoin", {
                        count: stats?.users ?? String(userCount),
                      })
                    : m.ctaFirst}
                </p>
                <Link
                  href={isLoggedIn ? "/dashboard" : "/signup"}
                  className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-3.5 text-base font-semibold shadow-xl shadow-purple-500/30 transition-all hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500"
                >
                  {isLoggedIn ? m.ctaButtonLoggedIn : m.ctaButtonGuest}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5 px-6 py-12">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
            <Logo href="/" />
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
              <Link href="/discover" className="transition-colors hover:text-white">
                {t("nav.discover")}
              </Link>
              <Link href="#features" className="transition-colors hover:text-white">
                {t("nav.features")}
              </Link>
              <Link href="#faq" className="transition-colors hover:text-white">
                {t("nav.faq")}
              </Link>
              {!isLoggedIn && (
                <Link href="/login" className="transition-colors hover:text-white">
                  {t("nav.login")}
                </Link>
              )}
              <CommunityDiscordLink variant="header" />
            </nav>
            <p className="text-xs text-white/35">
              © {new Date().getFullYear()} Eyed.bio
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
