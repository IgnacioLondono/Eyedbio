"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ExternalLink,
  HelpCircle,
  LifeBuoy,
  Search,
  Share2,
} from "lucide-react";
import Logo from "@/components/layout/Logo";
import ShareProfileButton from "@/components/profile/ShareProfileButton";
import { useI18n } from "@/components/providers/LocaleProvider";

export interface DashboardTabItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface Props {
  tabs: DashboardTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  username: string;
  displayName?: string;
  supportEnabled?: boolean;
}

function SidebarNavItem({
  tab,
  isActive,
  onSelect,
}: {
  tab: DashboardTabItem;
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = tab.icon;
  const isAccount = tab.id === "account";

  return (
    <Link
      href={`/dashboard?tab=${tab.id}`}
      replace
      scroll={false}
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
        isActive
          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
          : "text-white/55 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-white" : "text-white/45"}`} />
      <span className="flex-1 text-sm font-medium">{tab.label}</span>
      {isAccount ? (
        <ChevronDown className={`h-4 w-4 shrink-0 ${isActive ? "text-white/80" : "text-white/30"}`} />
      ) : null}
    </Link>
  );
}

export function DashboardSidebar({
  tabs,
  activeTab,
  onTabChange,
  username,
  displayName,
  supportEnabled,
}: Props) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const filteredTabs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tabs;
    return tabs.filter(
      (tab) =>
        tab.label.toLowerCase().includes(q) || tab.description.toLowerCase().includes(q)
    );
  }, [query, tabs]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("dashboard-nav-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a10]">
      <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
        <Logo href="/" size="sm" className="mb-5 px-1" />

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            id="dashboard-nav-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("dashboard.searchPlaceholder")}
            className="w-full rounded-xl border border-white/[0.08] bg-[#12121a] py-2.5 pl-9 pr-14 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-white/35">
            {t("dashboard.searchShortcut")}
          </kbd>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-0.5">
          {filteredTabs.map((tab) => (
            <SidebarNavItem
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onSelect={() => onTabChange(tab.id)}
            />
          ))}
          {filteredTabs.length === 0 ? (
            <p className="px-3 py-2 text-xs text-white/35">{t("dashboard.searchEmpty")}</p>
          ) : null}
        </nav>

        <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
          {supportEnabled ? (
            <Link
              href="/support"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/10 px-3 py-2.5 text-sm font-medium text-purple-200 transition-colors hover:bg-purple-500/15"
            >
              <LifeBuoy className="h-4 w-4" />
              {t("dashboard.helpCenter")}
            </Link>
          ) : (
            <Link
              href="#faq"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/10 px-3 py-2.5 text-sm font-medium text-purple-200 transition-colors hover:bg-purple-500/15"
            >
              <HelpCircle className="h-4 w-4" />
              {t("dashboard.helpCenter")}
            </Link>
          )}
          <Link
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/10 px-3 py-2.5 text-sm font-medium text-purple-200 transition-colors hover:bg-purple-500/15"
          >
            <ExternalLink className="h-4 w-4" />
            {t("dashboard.myPage")}
          </Link>
          <ShareProfileButton
            username={username}
            displayName={displayName}
            variant="sidebar"
          />
        </div>
      </div>
    </aside>
  );
}

export function DashboardMobileNav({ tabs, activeTab, onTabChange }: Props) {
  const router = useRouter();

  return (
    <nav
      className="lg:hidden -mx-1 mb-5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      aria-label="Editor tabs"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={`/dashboard?tab=${tab.id}`}
            replace
            scroll={false}
            onClick={(e) => {
              e.preventDefault();
              onTabChange(tab.id);
              router.push(`/dashboard?tab=${tab.id}`);
            }}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 transition-all ${
              isActive
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                : "border border-white/[0.08] bg-[#12121a] text-white/50"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
