"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Ban,
  Eye,
  Link2,
  Shield,
  LifeBuoy,
  SlidersHorizontal,
} from "lucide-react";
import {
  AdminActionCard,
  AdminAlert,
  AdminPage,
  AdminPageHeader,
  AdminQuickActions,
  AdminStatCard,
  AdminStatsGrid,
  AdminSkeleton,
} from "@/components/admin/AdminUi";
import { AdminStats } from "@/types/admin";

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPage>
      <AdminPageHeader
        title="Resumen"
        description="Estado de la plataforma, accesos rápidos y métricas en tiempo real."
        icon={<Shield className="h-5 w-5" />}
      />

      {error ? (
        <div className="mb-6">
          <AdminAlert tone="error">{error}</AdminAlert>
        </div>
      ) : null}

      {loading && !stats ? (
        <AdminSkeleton className="mb-8 h-48" />
      ) : (
        <AdminStatsGrid>
          <AdminStatCard
            label="Usuarios"
            value={stats?.users}
            icon={<Users className="h-5 w-5" />}
            href="/admin/users"
            loading={loading}
          />
          <AdminStatCard
            label="Bloqueados"
            value={stats?.blockedUsers}
            icon={<Ban className="h-5 w-5" />}
            href="/admin/users"
            loading={loading}
          />
          <AdminStatCard
            label="Admins"
            value={stats?.admins}
            icon={<Shield className="h-5 w-5" />}
            loading={loading}
          />
          <AdminStatCard
            label="Visitas"
            value={stats?.profileViews}
            icon={<Eye className="h-5 w-5" />}
            loading={loading}
          />
          <AdminStatCard
            label="Enlaces"
            value={stats?.links}
            icon={<Link2 className="h-5 w-5" />}
            loading={loading}
          />
          <AdminStatCard
            label="Tickets abiertos"
            value={stats?.openSupportTickets}
            icon={<LifeBuoy className="h-5 w-5" />}
            href="/admin/support"
            highlight={(stats?.openSupportTickets ?? 0) > 0}
            loading={loading}
          />
        </AdminStatsGrid>
      )}

      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-white/35">
          Acciones rápidas
        </h2>
        <AdminQuickActions>
          <AdminActionCard
            href="/admin/users"
            title="Gestionar usuarios"
            description="Busca cuentas, bloquea accesos y asigna insignias verificadas u owner."
            icon={<Users className="h-5 w-5" />}
          />
          <AdminActionCard
            href="/admin/support"
            title="Cola de soporte"
            description="Responde tickets abiertos y cierra incidencias de usuarios."
            icon={<LifeBuoy className="h-5 w-5" />}
          />
          <AdminActionCard
            href="/admin/settings"
            title="Configuración global"
            description="Activa funciones del sitio, login con Discord, reseñas, audio y más."
            icon={<SlidersHorizontal className="h-5 w-5" />}
          />
        </AdminQuickActions>
      </div>
    </AdminPage>
  );
}
