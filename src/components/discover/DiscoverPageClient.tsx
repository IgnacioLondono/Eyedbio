"use client";

import { Suspense } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, UserRound } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import AppAreaNav from "@/components/layout/AppAreaNav";
import Logo from "@/components/layout/Logo";
import CommunityDiscordLink from "@/components/layout/CommunityDiscordLink";
import ProfileDirectorySection from "@/components/discover/ProfileDirectorySection";
import { useI18n } from "@/components/providers/LocaleProvider";

export default function DiscoverPageClient() {
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const isLoggedIn = status === "authenticated" && !!session?.user;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {isLoggedIn ? (
        <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink">
              <Logo href="/" size="sm" responsiveText />
              <AppAreaNav active="discover" />
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <CommunityDiscordLink variant="header" />
              {session.user.username ? (
                <Link
                  href={`/${session.user.username}`}
                  title={t("nav.myProfile")}
                  aria-label={t("nav.myProfile")}
                  className="flex items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs text-white/60 hover:text-white border border-white/10 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                >
                  <UserRound className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline">{t("nav.myProfile")}</span>
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
                title={t("dashboard.signOut")}
                aria-label={t("dashboard.signOut")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
      ) : (
        <Navbar />
      )}

      <main className={isLoggedIn ? "" : "pt-16"}>
        <Suspense
          fallback={
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ProfileDirectorySection variant="page" />
        </Suspense>
      </main>
    </div>
  );
}
