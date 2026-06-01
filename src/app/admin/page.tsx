"use client";

import { useEffect, useState } from "react";
import { Users, Ban, Eye, Link2, Shield } from "lucide-react";
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
        { label: "Usuarios", value: stats.users, icon: Users },
        { label: "Bloqueados", value: stats.blockedUsers, icon: Ban },
        { label: "Administradores", value: stats.admins, icon: Shield },
        { label: "Visitas perfiles", value: stats.profileViews, icon: Eye },
        { label: "Enlaces", value: stats.links, icon: Link2 },
      ]
    : [];

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Panel de administración</h1>
      <p className="text-white/45 text-sm mb-8">
        Resumen de la plataforma Eyed.bio
      </p>

      {error ? <p className="text-red-400 text-sm mb-4">{error}</p> : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.length
          ? cards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <card.icon className="w-5 h-5 text-red-400 mb-3" />
                <div className="text-2xl font-bold">{card.value.toLocaleString("es-ES")}</div>
                <div className="text-white/40 text-sm mt-1">{card.label}</div>
              </div>
            ))
          : [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse"
              />
            ))}
      </div>
    </div>
  );
}
