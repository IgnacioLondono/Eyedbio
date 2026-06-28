"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, LayoutDashboard } from "lucide-react";
import { useI18n } from "@/components/providers/LocaleProvider";
import { pathsMatch } from "@/lib/client-navigation";

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
  const pathname = usePathname();
  const router = useRouter();

  const labels: Record<AppArea, string> = {
    dashboard: t("nav.editProfile"),
    discover: t("nav.discover"),
  };

  return (
    <nav
      className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-xl bg-white/[0.03] border border-white/5 shrink-0"
      aria-label={t("nav.appAreas")}
    >
      {AREAS.map(({ id, href, icon: Icon }) => {
        const isActive = active === id;
        const isCurrentPath = pathsMatch(pathname, href);

        return (
          <Link
            key={id}
            href={href}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            onClick={(event) => {
              if (isCurrentPath) {
                event.preventDefault();
                return;
              }
              event.preventDefault();
              router.push(href);
            }}
            className={`inline-flex items-center justify-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
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
