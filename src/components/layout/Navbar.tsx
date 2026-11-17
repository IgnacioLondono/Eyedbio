"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Globe, Menu, Search, User, X } from "lucide-react";
import Logo from "@/components/layout/Logo";
import CommunityDiscordLink from "@/components/layout/CommunityDiscordLink";
import { useI18n } from "@/components/providers/LocaleProvider";
import { APP_LOCALES, type AppLocale } from "@/lib/i18n/types";

interface Props {
  showCommunityLink?: boolean;
  /** Landing: links #features/#faq. App pages: omit anchors. */
  variant?: "landing" | "app";
}

const purpleCta =
  "rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-500 hover:to-violet-500";

function LocaleGlobe() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-white/85 hover:bg-white/10 transition-colors"
        aria-label={t("nav.menu")}
        aria-expanded={open}
      >
        <Globe className="h-[18px] w-[18px]" strokeWidth={1.75} />
        <span className="text-xs font-medium tracking-wide">{locale.toUpperCase()}</span>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[7.5rem] overflow-hidden rounded-xl border border-purple-500/20 bg-[#12081c]/95 py-1 shadow-xl shadow-purple-900/40 backdrop-blur-xl">
            {APP_LOCALES.map((code: AppLocale) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  void setLocale(code);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                  locale === code
                    ? "bg-purple-500/20 text-white"
                    : "text-white/70 hover:bg-purple-500/10 hover:text-white"
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const linkClass =
  "text-[15px] font-normal text-white/90 hover:text-white transition-colors whitespace-nowrap";

export default function Navbar({
  showCommunityLink = true,
  variant = "landing",
}: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isLanding = variant === "landing";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const accountHref = isLoggedIn
    ? session.user.username
      ? `/${session.user.username}`
      : "/dashboard"
    : "/login";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300 ${
        scrolled || open
          ? "border-b border-purple-500/15 bg-[#0a0612]/75 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8 md:h-16">
        {/* Left: brand + primary links (Meta layout) */}
        <div className="flex min-w-0 flex-1 items-center gap-6 lg:gap-8">
          <Logo href="/" size="md" />

          <div className="hidden items-center gap-5 lg:gap-7 md:flex">
            <Link href="/discover" className={linkClass}>
              {t("nav.discover")}
            </Link>
            <Link href="/marketplace" className={linkClass}>
              {t("nav.marketplace")}
            </Link>
            {isLanding && (
              <>
                <Link href="#features" className={linkClass}>
                  {t("nav.features")}
                </Link>
                <Link href="#faq" className={linkClass}>
                  {t("nav.faq")}
                </Link>
              </>
            )}
            {showCommunityLink && (
              <CommunityDiscordLink variant="header" className="!gap-2" />
            )}
          </div>
        </div>

        {/* Right: utilities */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/support" className={`${linkClass} px-2 py-1.5`}>
            {t("nav.support")}
          </Link>
          <Link
            href="/discover"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/85 hover:bg-purple-500/15 transition-colors"
            aria-label={t("nav.discover")}
            title={t("nav.discover")}
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </Link>
          <LocaleGlobe />
          <Link
            href={accountHref}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/85 hover:bg-purple-500/15 transition-colors"
            aria-label={isLoggedIn ? t("nav.myProfile") : t("nav.login")}
            title={isLoggedIn ? t("nav.myProfile") : t("nav.login")}
          >
            <User className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </Link>
          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className={`ml-1 ${purpleCta}`}
          >
            {isLoggedIn ? t("nav.editProfile") : t("nav.signup")}
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:bg-purple-500/15 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={t("nav.menu")}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-purple-500/15 bg-[#0a0612]/95 px-4 py-5 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-lg flex-col gap-1">
            <Link
              href="/discover"
              className="rounded-lg px-3 py-3 text-base text-white/90 hover:bg-purple-500/10"
              onClick={() => setOpen(false)}
            >
              {t("nav.discover")}
            </Link>
            <Link
              href="/marketplace"
              className="rounded-lg px-3 py-3 text-base text-white/90 hover:bg-purple-500/10"
              onClick={() => setOpen(false)}
            >
              {t("nav.marketplace")}
            </Link>
            {isLanding && (
              <>
                <Link
                  href="#features"
                  className="rounded-lg px-3 py-3 text-base text-white/90 hover:bg-purple-500/10"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.features")}
                </Link>
                <Link
                  href="#faq"
                  className="rounded-lg px-3 py-3 text-base text-white/90 hover:bg-purple-500/10"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.faq")}
                </Link>
              </>
            )}
            <Link
              href="/support"
              className="rounded-lg px-3 py-3 text-base text-white/90 hover:bg-purple-500/10"
              onClick={() => setOpen(false)}
            >
              {t("nav.support")}
            </Link>
            {showCommunityLink && (
              <div className="px-3 py-2">
                <CommunityDiscordLink variant="header" className="w-full justify-start" />
              </div>
            )}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-purple-500/15 px-3 pt-4">
              <LocaleGlobe />
              <Link
                href={accountHref}
                className="inline-flex items-center gap-2 text-sm text-white/85"
                onClick={() => setOpen(false)}
              >
                <User className="h-4 w-4" />
                {isLoggedIn ? t("nav.myProfile") : t("nav.login")}
              </Link>
            </div>
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className={`mt-3 block text-center ${purpleCta} py-3`}
              onClick={() => setOpen(false)}
            >
              {isLoggedIn ? t("nav.editProfile") : t("nav.signup")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
