"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n";

type LandingMessages = ReturnType<typeof getMessages>["landing"];

// Devuelve la ruta de la imagen según el idioma (variantes con sufijo -en).
// ?v= fuerza recarga si el PNG cambia pero la ruta no (caché de next/image).
export const LANDING_SHOWCASE_VERSION = "3";

function localizedSrc(base: string, locale: string) {
  const file = locale === "en" ? `${base}-en.png` : `${base}.png`;
  return `/landing/${file}?v=${LANDING_SHOWCASE_VERSION}`;
}

const DASHBOARD_SLIDE_DEFS = [
  { id: "perfil", base: "dashboard-perfil", labelKey: "gunsShowcaseLabelProfile" },
  { id: "enlaces", base: "dashboard-enlaces", labelKey: "gunsShowcaseLabelLinks" },
  { id: "media", base: "dashboard-media", labelKey: "gunsShowcaseLabelMedia" },
  { id: "estilo", base: "dashboard-estilo", labelKey: "gunsShowcaseLabelStyle" },
] as const;

const TOTAL_SLIDES = DASHBOARD_SLIDE_DEFS.length;

export default function LandingGunsShowcase() {
  const { locale } = useI18n();
  const m = getMessages(locale).landing as LandingMessages;
  const [index, setIndex] = useState(0);

  const slides = DASHBOARD_SLIDE_DEFS.map((slide) => ({
    id: slide.id,
    src: localizedSrc(slide.base, locale),
    label: m[slide.labelKey],
  }));

  const current = slides[index];

  const go = useCallback((delta: number) => {
    setIndex((i) => (i + delta + TOTAL_SLIDES) % TOTAL_SLIDES);
  }, []);

  return (
    <div className="relative w-full mt-12 md:mt-16">
      <div className="relative mx-auto max-w-5xl">
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

        <div className="flex justify-center">
          <div
            className="relative mx-auto w-full max-w-[900px]"
            style={{ perspective: "1400px" }}
          >
            <div
              className="relative origin-center transition-transform duration-500 lg:[transform:rotateY(8deg)_rotateX(2deg)_translateZ(0)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute -inset-3 rounded-2xl bg-purple-600/20 blur-2xl" aria-hidden />
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d14] shadow-[0_30px_80px_-20px_rgba(124,58,237,0.45)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <Image
                      src={current.src}
                      alt={`Eyed.bio — ${current.label}`}
                      width={1280}
                      height={720}
                      className="h-auto w-full"
                      priority={index === 0}
                      unoptimized
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-8 flex flex-col items-center gap-3"
          role="tablist"
          aria-label={m.gunsShowcaseAria}
        >
          <p className="text-sm text-white/50">{current.label}</p>
          <div className="flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
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
