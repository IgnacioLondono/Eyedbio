"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n";

const DASHBOARD_SLIDES = [
  { id: "perfil", src: "/landing/dashboard-perfil.png", label: "Perfil" },
  { id: "enlaces", src: "/landing/dashboard-enlaces.png", label: "Enlaces" },
  { id: "media", src: "/landing/dashboard-media.png", label: "Media" },
  { id: "estilo", src: "/landing/dashboard-estilo.png", label: "Estilo" },
] as const;

const PROFILE_SLIDE = {
  id: "profile",
  src: "/landing/profile-kiddis.png",
  label: "Perfil público",
} as const;

const TOTAL_SLIDES = DASHBOARD_SLIDES.length + 1;

export default function LandingGunsShowcase() {
  const { locale } = useI18n();
  const m = getMessages(locale).landing;
  const [index, setIndex] = useState(0);

  const isProfileFocus = index === DASHBOARD_SLIDES.length;
  const dashboardIndex = isProfileFocus ? DASHBOARD_SLIDES.length - 1 : index;
  const currentDashboard = DASHBOARD_SLIDES[dashboardIndex];

  const go = useCallback((delta: number) => {
    setIndex((i) => (i + delta + TOTAL_SLIDES) % TOTAL_SLIDES);
  }, []);

  return (
    <div className="relative w-full mt-12 md:mt-16">
      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-3 mb-6 md:absolute md:left-0 md:right-0 md:-top-2 md:mb-0 md:z-20 md:pointer-events-none">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={m.gunsShowcasePrev}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={m.gunsShowcaseNext}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-4 xl:gap-8">
          <div
            className={`relative mx-auto w-full max-w-[640px] lg:max-w-none lg:justify-self-end ${
              isProfileFocus ? "opacity-30 blur-[1px] scale-[0.97]" : ""
            } transition-all duration-500`}
            style={{ perspective: "1400px" }}
          >
            <div
              className="relative origin-center transition-transform duration-500 lg:[transform:rotateY(10deg)_rotateX(3deg)_translateZ(0)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute -inset-3 rounded-2xl bg-purple-600/20 blur-2xl" aria-hidden />
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d14] shadow-[0_30px_80px_-20px_rgba(124,58,237,0.45)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDashboard.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <Image
                      src={currentDashboard.src}
                      alt={`Eyed.bio — ${currentDashboard.label}`}
                      width={1280}
                      height={720}
                      className="h-auto w-full"
                      priority={index === 0}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div
            className="relative mx-auto h-[320px] w-full max-w-[240px] sm:h-[380px] sm:max-w-[260px] md:h-[420px] md:max-w-[280px] lg:mx-0 lg:justify-self-start"
            style={{ perspective: "1200px" }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-[88%] w-[78%] -translate-x-[42%] -translate-y-[46%] overflow-hidden rounded-[1.4rem] border border-white/5 bg-[#0a0a0f] opacity-35 shadow-xl"
              style={{ transform: "rotate(6deg) translateZ(-40px)" }}
              aria-hidden
            >
              <Image
                src={PROFILE_SLIDE.src}
                alt=""
                width={390}
                height={780}
                className="h-full w-full object-cover object-top"
              />
            </div>

            <div
              className="absolute left-1/2 top-1/2 h-[92%] w-[84%] -translate-x-[48%] -translate-y-[48%] overflow-hidden rounded-[1.4rem] border border-white/8 bg-[#0a0a0f] opacity-55 shadow-xl"
              style={{ transform: "rotate(3deg) translateZ(-20px)" }}
              aria-hidden
            >
              <Image
                src={PROFILE_SLIDE.src}
                alt=""
                width={390}
                height={780}
                className="h-full w-full object-cover object-top"
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isProfileFocus ? "profile-focus" : `profile-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isProfileFocus ? 1.04 : 1,
                }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 z-10 h-full w-[92%] overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#0a0a0f] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]"
                style={{ transform: "translate(-50%, -50%) rotate(-2deg)" }}
              >
                <Image
                  src={PROFILE_SLIDE.src}
                  alt={PROFILE_SLIDE.label}
                  width={390}
                  height={780}
                  className="h-full w-full object-cover object-top"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div
          className="mt-8 flex flex-col items-center gap-3"
          role="tablist"
          aria-label={m.gunsShowcaseAria}
        >
          <p className="text-sm text-white/50">
            {isProfileFocus ? PROFILE_SLIDE.label : currentDashboard.label}
          </p>
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${m.gunsShowcaseSlide} ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-purple-500" : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
