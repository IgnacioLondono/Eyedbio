"use client";

import Link from "next/link";
import { Compass, LayoutDashboard } from "lucide-react";
import { useI18n } from "@/components/LocaleProvider";

export type AppArea = "dashboard" | "discover";

interface Props {
  active: AppArea;
}

const AREAS: { id: AppArea; href: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "discover", href: "/discover", icon: Compass },
];

export default function AppAreaNav({ active }: Props) {
  const { t } = useI18n();

  const labels: Record<AppArea, string> = {
    dashboard: t("nav.editProfile"),
    discover: t("nav.discover"),
  };

  return (
    <nav
      className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5"
      aria-label={t("nav.appAreas")}
    >
      {AREAS.map(({ id, href, icon: Icon }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            href={href}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{labels[id]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
