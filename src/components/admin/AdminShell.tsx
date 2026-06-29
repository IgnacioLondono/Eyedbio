"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ExternalLink,
  Shield,
  SlidersHorizontal,
  LifeBuoy,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import Logo from "@/components/layout/Logo";

interface Props {
  children: React.ReactNode;
  adminEmail?: string | null;
}

const NAV = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Usuarios", icon: Users, exact: false },
  { href: "/admin/support", label: "Soporte", icon: LifeBuoy, exact: false, badgeKey: "support" as const },
  { href: "/admin/settings", label: "Configuración", icon: SlidersHorizontal, exact: false },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Resumen",
  "/admin/users": "Usuarios",
  "/admin/support": "Soporte",
  "/admin/settings": "Configuración",
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/admin/users")) return "Usuarios";
  if (pathname.startsWith("/admin/support")) return "Soporte";
  if (pathname.startsWith("/admin/settings")) return "Configuración";
  return "Admin";
}

export default function AdminShell({ children, adminEmail }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openTickets, setOpenTickets] = useState(0);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.openSupportTickets === "number") {
          setOpenTickets(data.openSupportTickets);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const pageTitle = resolveTitle(pathname);

  const sidebar = (
    <>
      <div className="shrink-0 border-b border-white/[0.06] p-5">
        <Logo href="/admin" size="sm" responsiveText />
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/15 bg-rose-500/[0.06] px-3 py-2">
          <Shield className="h-4 w-4 shrink-0 text-rose-300" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-rose-100/90">Panel admin</p>
            {adminEmail ? (
              <p className="truncate text-[10px] text-white/35">{adminEmail}</p>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const badge = item.badgeKey === "support" && openTickets > 0 ? openTickets : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                active
                  ? "border-rose-500/25 bg-gradient-to-r from-rose-500/15 to-orange-500/5 text-white shadow-sm shadow-rose-950/20"
                  : "border-transparent text-white/55 hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-rose-300" : ""}`} />
                {item.label}
              </span>
              {badge > 0 ? (
                <span className="min-w-[1.35rem] rounded-full bg-amber-500/20 px-1.5 py-0.5 text-center text-[10px] font-bold text-amber-200">
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : active ? (
                <ChevronRight className="h-3.5 w-3.5 text-rose-300/60" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 space-y-1 border-t border-white/[0.06] p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white/45 transition hover:bg-white/[0.03] hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Mi dashboard
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-white/45 transition hover:bg-white/[0.03] hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      <div className="lg:flex min-h-screen">
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0a0a10]/90 px-4 backdrop-blur-xl lg:hidden">
          <Logo href="/admin" size="sm" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">{pageTitle}</span>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-xl border border-white/10 p-2 text-white/70"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col border-r border-white/[0.06] bg-[#0a0a10] transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-svh lg:max-h-svh lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebar}
        </aside>

        <main className="min-w-0 flex-1">
          <div className="hidden border-b border-white/[0.06] bg-[#0a0a10]/50 px-6 py-3 backdrop-blur-sm lg:block">
            <p className="text-xs text-white/35">
              Eyed.bio <span className="text-white/20">/</span>{" "}
              <span className="text-white/60">{pageTitle}</span>
            </p>
          </div>
          <div className="min-h-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(244,63,94,0.08),transparent)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
