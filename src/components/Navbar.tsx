"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import CommunityDiscordLink from "@/components/CommunityDiscordLink";
import { useI18n } from "@/components/LocaleProvider";
import { APP_LOCALES } from "@/lib/i18n/types";

interface Props {
  showCommunityLink?: boolean;
}

function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className={`flex items-center gap-0.5 rounded-lg border border-white/10 p-0.5 ${
        compact ? "text-[10px]" : "text-xs"
      } font-medium`}
      role="group"
      aria-label="Language"
    >
      {APP_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => void setLocale(code)}
          className={`px-2 py-1 rounded transition-colors ${
            locale === code
              ? "bg-white/10 text-white"
              : "text-white/45 hover:text-white"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Navbar({ showCommunityLink = true }: Props) {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const isLoggedIn = status === "authenticated" && !!session?.user;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo href="/" />

        <div className="hidden md:flex items-center gap-8">
          {showCommunityLink && <CommunityDiscordLink variant="header" />}
          <Link
            href="/discover"
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            {t("nav.discover")}
          </Link>
          {!isLoggedIn && (
            <>
              <Link href="#features" className="text-white/60 hover:text-white text-sm transition-colors">
                {t("nav.features")}
              </Link>
              <Link href="#faq" className="text-white/60 hover:text-white text-sm transition-colors">
                {t("nav.faq")}
              </Link>
            </>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LocaleSwitcher />
          {isLoggedIn ? (
            <>
              {session.user.username && (
                <Link
                  href={`/${session.user.username}`}
                  className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
                >
                  {t("nav.myProfile")}
                </Link>
              )}
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25"
              >
                {t("nav.editProfile")}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25"
              >
                {t("nav.signup")}
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-white/80"
          onClick={() => setOpen(!open)}
          aria-label={t("nav.menu")}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0f] px-6 py-4 space-y-3">
          <LocaleSwitcher compact />
          {showCommunityLink && (
            <CommunityDiscordLink variant="header" className="w-full justify-center" />
          )}
          <Link
            href="/discover"
            className="block text-white/60 hover:text-white text-sm"
            onClick={() => setOpen(false)}
          >
            {t("nav.discover")}
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="block w-full text-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg"
                onClick={() => setOpen(false)}
              >
                {t("nav.editProfile")}
              </Link>
              {session.user.username && (
                <Link
                  href={`/${session.user.username}`}
                  className="block text-white/60 hover:text-white text-sm"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.myProfile")}
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="#features" className="block text-white/60 hover:text-white text-sm" onClick={() => setOpen(false)}>
                {t("nav.features")}
              </Link>
              <Link href="#faq" className="block text-white/60 hover:text-white text-sm" onClick={() => setOpen(false)}>
                {t("nav.faq")}
              </Link>
              <Link href="/login" className="block text-white/60 hover:text-white text-sm" onClick={() => setOpen(false)}>
                {t("nav.login")}
              </Link>
              <Link
                href="/signup"
                className="block w-full text-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg"
                onClick={() => setOpen(false)}
              >
                {t("nav.signup")}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
