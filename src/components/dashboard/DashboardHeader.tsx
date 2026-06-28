"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ExternalLink, LifeBuoy, LogOut, Save, UserRound } from "lucide-react";
import Logo from "@/components/layout/Logo";
import AppAreaNav from "@/components/layout/AppAreaNav";
import CommunityDiscordLink from "@/components/layout/CommunityDiscordLink";
import { useI18n } from "@/components/providers/LocaleProvider";

interface Props {
  username: string;
  isDirty: boolean;
  justSaved: boolean;
  saving: boolean;
  supportEnabled: boolean;
  onSave: () => void;
  onViewProfile: (event: React.MouseEvent) => void;
}

export default function DashboardHeader({
  username,
  isDirty,
  justSaved,
  saving,
  supportEnabled,
  onSave,
  onViewProfile,
}: Props) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07070c]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          <Logo href="/" size="sm" responsiveText />
          <AppAreaNav active="dashboard" />
        </div>

        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">
            eyed.bio/
          </span>
          <span className="max-w-[140px] truncate text-xs font-mono text-purple-300/90">{username}</span>
          {isDirty ? (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-200/90">
              {t("dashboard.unsavedBadge")}
            </span>
          ) : justSaved ? (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300/90">
              {t("dashboard.saved")}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <CommunityDiscordLink variant="header" />
          {supportEnabled ? (
            <Link
              href="/support"
              title={t("dashboard.supportLink")}
              aria-label={t("dashboard.supportLink")}
              className="flex shrink-0 items-center justify-center rounded-xl border border-white/[0.08] p-2 text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white sm:px-3 sm:py-1.5"
            >
              <LifeBuoy className="h-3.5 w-3.5 shrink-0" />
              <span className="ml-1.5 hidden text-xs lg:inline">{t("nav.support")}</span>
            </Link>
          ) : null}
          <Link
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onViewProfile}
            title={t("dashboard.viewProfile")}
            aria-label={t("dashboard.viewProfile")}
            className={`flex shrink-0 items-center justify-center gap-1.5 rounded-xl border p-2 text-xs transition-colors sm:px-3 sm:py-1.5 ${
              isDirty
                ? "border-amber-400/25 text-amber-200/90 hover:bg-amber-500/10"
                : "border-white/[0.08] text-white/55 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <UserRound className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden md:inline">{t("dashboard.viewProfile")}</span>
            <ExternalLink className="hidden h-3 w-3 shrink-0 sm:block" />
          </Link>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            title={
              justSaved ? t("dashboard.saved") : saving ? t("dashboard.saving") : t("dashboard.save")
            }
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 transition-colors hover:bg-purple-500 disabled:opacity-50 sm:px-4"
          >
            <Save className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">
              {justSaved ? t("dashboard.saved") : saving ? t("dashboard.saving") : t("dashboard.save")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-xl p-2 text-white/35 transition-colors hover:bg-white/[0.04] hover:text-white"
            title={t("dashboard.signOut")}
            aria-label={t("dashboard.signOut")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
