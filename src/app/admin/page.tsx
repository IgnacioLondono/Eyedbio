"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Ban,
  Eye,
  Link2,
  Shield,
  LifeBuoy,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { AdminStats } from "@/types/admin";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"));
  }, []);

  const cards = stats
    ? [
        { label: "Usuarios", value: stats.users, icon: Users, href: "/admin/users" },
        { label: "Bloqueados", value: stats.blockedUsers, icon: Ban, href: "/admin/users" },
        { label: "Admins", value: stats.admins, icon: Shield },
        { label: "Visitas", value: stats.profileViews, icon: Eye },
        { label: "Enlaces", value: stats.links, icon: Link2 },
        {
          label: "Tickets abiertos",
          value: stats.openSupportTickets,
          icon: LifeBuoy,
          href: "/admin/support",
          highlight: stats.openSupportTickets > 0,
        },
      ]
    : [];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl">
      <AdminPageHeader
        title="Panel de administración"
        description="Resumen de Eyed.bio y accesos rápidos."
        icon={<Shield className="w-5 h-5" />}
      />

      {error ? <p className="text-red-400 text-sm mb-4">{error}</p> : null}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {cards.length
          ? cards.map((card) => {
              const inner = (
                <>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <card.icon
                      className={`w-5 h-5 ${card.highlight ? "text-amber-400" : "text-red-400"}`}
                    />
                    {card.href ? <ArrowRight className="w-4 h-4 text-white/20" /> : null}
                  </div>
                  <div className="text-3xl font-bold tracking-tight">
                    {(card.value ?? 0).toLocaleString("es-ES")}
                  </div>
                  <div className="text-white/40 text-sm mt-1">{card.label}</div>
                </>
              );

              return card.href ? (
                <Link
                  key={card.label}
                  href={card.href}
                  className={`rounded-2xl border p-5 transition-colors hover:bg-white/[0.05] ${
                    card.highlight
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={card.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  {inner}
                </div>
              );
            })
          : [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse"
              />
            ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/admin/support"
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-colors"
        >
          <LifeBuoy className="w-5 h-5 text-red-400 mb-3" />
          <h2 className="font-semibold">Gestionar soporte</h2>
          <p className="text-sm text-white/45 mt-1">
            Revisa tickets de usuarios y responde desde el panel.
          </p>
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-red-400 mb-3" />
          <h2 className="font-semibold">Configuración del sitio</h2>
          <p className="text-sm text-white/45 mt-1">
            Activa funciones globales, soporte y Discord.
          </p>
        </Link>
      </div>
    </div>
  );
}
