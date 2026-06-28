"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
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
}

function NavButton({
  tab,
  isActive,
  onSelect,
  layout,
}: {
  tab: DashboardTabItem;
  isActive: boolean;
  onSelect: () => void;
  layout: "sidebar" | "mobile";
}) {
  const Icon = tab.icon;

  if (layout === "sidebar") {
    return (
      <Link
        href={`/dashboard?tab=${tab.id}`}
        replace
        scroll={false}
        onClick={(e) => {
          e.preventDefault();
          onSelect();
        }}
        className={`group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
          isActive
            ? "bg-purple-600/15 text-white ring-1 ring-purple-500/30"
            : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
        }`}
      >
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isActive ? "bg-purple-600 text-white" : "bg-white/[0.05] group-hover:bg-white/[0.08]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="text-sm font-medium leading-none">{tab.label}</p>
          <p className="mt-1 text-[11px] leading-snug text-white/35 group-hover:text-white/45">
            {tab.description}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/dashboard?tab=${tab.id}`}
      replace
      scroll={false}
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
      className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 min-w-[4.5rem] transition-all ${
        isActive
          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
          : "text-white/45 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
    </Link>
  );
}

export function DashboardSidebar({ tabs, activeTab, onTabChange }: Props) {
  const { t } = useI18n();

  return (
    <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[#07070c]/50">
      <div className="sticky top-14 flex max-h-[calc(100vh-3.5rem)] flex-col gap-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
          {t("dashboard.editorNav")}
        </p>
        {tabs.map((tab) => (
          <NavButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onSelect={() => onTabChange(tab.id)}
            layout="sidebar"
          />
        ))}
      </div>
    </aside>
  );
}

export function DashboardMobileNav({ tabs, activeTab, onTabChange }: Props) {
  const router = useRouter();

  return (
    <nav
      className="lg:hidden -mx-1 mb-5 flex gap-1 overflow-x-auto pb-1 scrollbar-none"
      aria-label="Editor tabs"
    >
      {tabs.map((tab) => (
        <NavButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onSelect={() => {
            onTabChange(tab.id);
            router.push(`/dashboard?tab=${tab.id}`);
          }}
          layout="mobile"
        />
      ))}
    </nav>
  );
}
