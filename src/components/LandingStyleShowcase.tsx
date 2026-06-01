"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Shuffle } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import BackgroundEffects from "@/components/BackgroundEffects";
import { LANDING_STYLE_DEMOS } from "@/lib/demo-profiles";

const ROTATE_MS = 4500;

export default function LandingStyleShowcase() {
  const [index, setIndex] = useState(0);
  const demo = LANDING_STYLE_DEMOS[index];

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % LANDING_STYLE_DEMOS.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  const comboCount =
    7 * 4 * 3 *
    6 *
    2 *
    2;

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-200 mb-4">
              <Layers className="w-3.5 h-3.5" />
              Compositor de estilos
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Miles de combinaciones,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                una sola bio
              </span>
            </h2>
            <p className="text-white/60 text-lg mb-6 leading-relaxed">
              Elige estructura de tarjeta, forma de mostrar enlaces, avatar, colores,
              efectos de fondo y nombre. Mezcla layout lateral, banner, botones apilados
              o modo minimal — sin plantillas copiadas de otro sitio.
            </p>
            <ul className="space-y-3 text-white/50 text-sm">
              <li className="flex items-start gap-2">
                <Shuffle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white/80">7 estructuras</strong> — clásica, hero,
                  lateral, banner, minimal, stack y cristal.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Shuffle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white/80">4 modos de enlaces</strong> — iconos,
                  botones, fila o chips.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Shuffle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  Más colores, blur, gradientes y efectos → más de{" "}
                  <strong className="text-white/80">{comboCount.toLocaleString("es")}</strong>{" "}
                  combinaciones posibles.
                </span>
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[300px]">
            <div className="absolute -inset-4 bg-purple-600/20 blur-3xl rounded-full" />
            <div className="relative aspect-[9/14] rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0f] shadow-2xl">
              <div
                className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#0f0a1a] to-purple-950"
                aria-hidden
              />
              <BackgroundEffects effect={demo.settings.backgroundEffect} contained />
              <div className="absolute inset-0 flex items-center justify-center p-5 z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={demo.username}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="w-full"
                  >
                    <ProfileCard profile={demo} compact />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <p className="text-center text-xs text-white/40 mt-4">
              Vista: <span className="text-purple-300">{demo.displayName}</span> ·{" "}
              {demo.settings.cardLayout} / {demo.settings.linkStyle}
            </p>
            <div className="flex justify-center gap-1.5 mt-3">
              {LANDING_STYLE_DEMOS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Estilo ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-purple-500" : "w-1.5 bg-white/20"
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
