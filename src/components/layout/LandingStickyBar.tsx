"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/providers/LocaleProvider";

/**
 * Barra secundaria estilo Meta Quest: debajo del nav, sticky al hacer scroll
 * (no fija en el fondo de la pantalla).
 */
export default function LandingStickyBar() {
  const { status } = useSession();
  const { t } = useI18n();
  const isLoggedIn = status === "authenticated";

  return (
    <div className="sticky top-14 z-40 border-b border-purple-500/15 bg-[#0f0a18]/95 text-white shadow-[0_8px_30px_rgba(88,28,135,0.2)] backdrop-blur-xl md:top-16">
      <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between gap-4 px-4 sm:h-14 sm:px-6 lg:px-8">
        <p className="truncate text-base font-semibold tracking-tight sm:text-lg">
          Eyed<span className="text-purple-400">.bio</span>
        </p>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <p className="hidden text-xs text-white/50 sm:block md:text-sm">
            {isLoggedIn ? t("nav.editProfile") : t("landing.signupFree")}
          </p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:from-purple-500 hover:to-violet-500"
          >
            {isLoggedIn ? t("landing.ctaButtonLoggedIn") : t("landing.ctaButtonGuest")}
          </Link>
        </div>
      </div>
    </div>
  );
}
