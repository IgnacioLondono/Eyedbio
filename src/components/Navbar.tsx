"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import CommunityDiscordLink from "@/components/CommunityDiscordLink";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo href="/" />

        <div className="hidden md:flex items-center gap-8">
          <CommunityDiscordLink variant="header" />
          {!isLoggedIn && (
            <>
              <Link href="#features" className="text-white/60 hover:text-white text-sm transition-colors">
                Características
              </Link>
              <Link href="#faq" className="text-white/60 hover:text-white text-sm transition-colors">
                FAQ
              </Link>
            </>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {session.user.username && (
                <Link
                  href={`/${session.user.username}`}
                  className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
                >
                  Mi perfil
                </Link>
              )}
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25"
              >
                Registrarse gratis
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-white/80"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0f] px-6 py-4 space-y-3">
          <CommunityDiscordLink variant="header" className="w-full justify-center" />
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="block w-full text-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              {session.user.username && (
                <Link
                  href={`/${session.user.username}`}
                  className="block text-white/60 hover:text-white text-sm"
                  onClick={() => setOpen(false)}
                >
                  Mi perfil
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="#features" className="block text-white/60 hover:text-white text-sm" onClick={() => setOpen(false)}>
                Características
              </Link>
              <Link href="#faq" className="block text-white/60 hover:text-white text-sm" onClick={() => setOpen(false)}>
                FAQ
              </Link>
              <Link href="/login" className="block text-white/60 hover:text-white text-sm" onClick={() => setOpen(false)}>
                Iniciar sesión
              </Link>
              <Link
                href="/signup"
                className="block w-full text-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg"
                onClick={() => setOpen(false)}
              >
                Registrarse gratis
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
