"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Layers, Shuffle } from "lucide-react";
import ProfileCard from "@/components/profile/ProfileCard";
import BackgroundEffects from "@/components/media/BackgroundEffects";
import { resolveCardLayout, resolveLinkStyle } from "@/lib/config/card-layout-config";
import { LANDING_STYLE_DEMOS } from "@/lib/profile/demo-profiles";
import { useI18n } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n";
import type { CardLayout, LinkStyle } from "@/types/profile";

const ROTATE_MS = 5000;
const PAUSE_AFTER_MANUAL_MS = 14_000;

export default function LandingStyleShowcase() {
  const { locale, tVars } = useI18n();
  const m = getMessages(locale).landing;
  const layouts = getMessages(locale).cardLayouts;
  const linkStyles = getMessages(locale).linkStyles;
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const demo = LANDING_STYLE_DEMOS[index];
  const layout = resolveCardLayout(demo.settings);
  const linkStyle = resolveLinkStyle(demo.settings);
  const comboCount = 7 * 4 * 3 * 6 * 2 * 2;

  const layoutLabel = (value: CardLayout) => layouts[value]?.label ?? value;
  const linkLabel = (value: LinkStyle) => linkStyles[value]?.label ?? value;

  const selectDemo = useCallback((next: number) => {
    setIndex(next);
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, PAUSE_AFTER_MANUAL_MS);
  }, []);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const timer = setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => (i + 1) % LANDING_STYLE_DEMOS.length);
    }, ROTATE_MS);

    return () => {
      clearInterval(timer);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-200 mb-4">
              <Layers className="w-3.5 h-3.5" />
              {m.showcaseBadge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {m.showcaseTitle}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {m.showcaseTitleHighlight}
              </span>
            </h2>
            <p className="text-white/60 text-lg mb-6 leading-relaxed">{m.showcaseSubtitle}</p>
            <ul className="space-y-3 text-white/50 text-sm">
              <li className="flex items-start gap-2">
                <Shuffle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{m.showcaseBullet1}</span>
              </li>
              <li className="flex items-start gap-2">
                <Shuffle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{m.showcaseBullet2}</span>
              </li>
              <li className="flex items-start gap-2">
                <Shuffle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  {tVars("landing.showcaseBullet3", {
                    count: comboCount.toLocaleString(locale === "en" ? "en-US" : "es-ES"),
                  })}
                </span>
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[300px]">
            <div className="absolute -inset-4 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />
            <div className="relative aspect-[9/14] rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0f] shadow-2xl isolate">
              <div
                className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#0f0a1a] to-purple-950"
                aria-hidden
              />
              <BackgroundEffects effect={demo.settings.backgroundEffect} contained />
              <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="min-h-full flex items-center justify-center px-4 py-5">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="w-full flex justify-center"
                  >
                    <ProfileCard profile={demo} compact showcase />
                  </motion.div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-white/40 mt-4">
              {m.showcaseViewLabel}{" "}
              <span className="text-purple-300">{demo.displayName}</span> ·{" "}
              {layoutLabel(layout)} / {linkLabel(linkStyle)}
            </p>
            <div
              className="flex justify-center gap-1.5 mt-3"
              role="tablist"
              aria-label={m.showcaseTabsLabel}
            >
              {LANDING_STYLE_DEMOS.map((item, i) => (
                <button
                  key={item.username}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`${m.showcaseTabsLabel}: ${item.displayName}`}
                  onClick={() => selectDemo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-purple-500" : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
