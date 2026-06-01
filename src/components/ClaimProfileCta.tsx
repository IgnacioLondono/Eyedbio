"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";

export default function ClaimProfileCta() {
  const { status } = useSession();

  if (status !== "unauthenticated") return null;

  return (
    <div className="fixed bottom-8 md:bottom-10 left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div className="rounded-2xl border border-white/10 bg-black/70 px-5 py-4 shadow-2xl backdrop-blur-md text-center">
        <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
          <Sparkles className="h-4 w-4" />
        </span>
        <p className="mt-3 text-sm font-semibold text-white">Reclama tu perfil</p>
        <p className="mt-1 text-xs leading-relaxed text-white/50">
          Crea tu página link-in-bio gratis en Eyed.bio
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-purple-500"
          >
            Crear cuenta
          </Link>
          <Link
            href="/login?callbackUrl=/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/90 transition-colors hover:bg-white/10"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
