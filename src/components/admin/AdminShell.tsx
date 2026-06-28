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
} from "lucide-react";
import Logo from "@/components/layout/Logo";

interface Props {
  children: React.ReactNode;
  adminEmail?: string | null;
}

const nav = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Usuarios", icon: Users, exact: false },
  { href: "/admin/support", label: "Soporte", icon: LifeBuoy, exact: false, badgeKey: "support" as const },
  { href: "/admin/settings", label: "Sitio", icon: SlidersHorizontal, exact: false },
];

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

  const sidebar = (
    <>
      <div className="shrink-0 p-5 border-b border-white/10">
        <Logo href="/admin" size="sm" responsiveText />
        <div className="mt-3 flex items-center gap-2 text-xs text-red-300/90">
          <Shield className="w-3.5 h-3.5" />
          Administración
        </div>
        {adminEmail ? (
          <p className="text-[10px] text-white/35 mt-2 truncate">{adminEmail}</p>
        ) : null}
      </div>

      <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const badge = item.badgeKey === "support" && openTickets > 0 ? openTickets : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-red-500/15 text-red-100 border border-red-500/25"
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </span>
              {badge > 0 ? (
                <span className="min-w-[1.25rem] rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200 text-center">
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 mt-auto p-3 border-t border-white/10 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white rounded-lg hover:bg-white/5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Mi dashboard
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white rounded-lg hover:bg-white/5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      <div className="lg:flex min-h-screen">
        <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 h-14 border-b border-white/10 bg-[#0c0c14]/95 backdrop-blur-xl">
          <Logo href="/admin" size="sm" />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-lg border border-white/10 text-white/70"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <button
            type="button"
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 lg:sticky lg:top-0 lg:h-svh lg:max-h-svh lg:inset-y-auto left-0 z-50 w-64 shrink-0 border-r border-white/10 bg-[#0c0c14] flex flex-col transform transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {sidebar}
        </aside>

        <main className="flex-1 min-w-0 overflow-auto">
          <div className="min-h-full bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.06),_transparent_50%)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
