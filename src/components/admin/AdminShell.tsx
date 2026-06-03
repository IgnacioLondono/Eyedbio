"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ExternalLink,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import Logo from "@/components/Logo";

interface Props {
  children: React.ReactNode;
  adminEmail?: string | null;
}

const nav = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Usuarios", icon: Users, exact: false },
  { href: "/admin/settings", label: "Sitio", icon: SlidersHorizontal, exact: false },
];

export default function AdminShell({ children, adminEmail }: Props) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <aside className="w-60 shrink-0 border-r border-white/10 bg-[#0c0c14] flex flex-col">
        <div className="p-5 border-b border-white/10">
          <Logo href="/admin" size="sm" />
          <div className="mt-3 flex items-center gap-2 text-xs text-red-300/90">
            <Shield className="w-3.5 h-3.5" />
            Administración
          </div>
          {adminEmail ? (
            <p className="text-[10px] text-white/35 mt-2 truncate">{adminEmail}</p>
          ) : null}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-red-500/15 text-red-200 border border-red-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
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
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
