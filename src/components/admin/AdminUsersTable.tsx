"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Ban, CheckCircle, Crown, Loader2, Search } from "lucide-react";
import { AdminUserRow } from "@/types/admin";
import { isAdminRole } from "@/lib/roles";

export default function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (query) params.set("q", query);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar");

      setUsers(data.users);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleBadge = async (userId: string, badge: "verified" | "owner") => {
    setActionId(userId);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleBadge", badge }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo completar");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setActionId(null);
    }
  };

  const runAction = async (userId: string, action: "block" | "unblock") => {
    const reason =
      action === "block"
        ? window.prompt("Motivo del bloqueo (opcional):") ?? undefined
        : undefined;

    if (action === "block" && reason === null) return;

    setActionId(userId);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo completar");

      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col sm:flex-row gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(q.trim());
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por email, usuario o nombre..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-500/40"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium"
        >
          Buscar
        </button>
      </form>

      {error ? <p className="text-red-400 text-sm">{error}</p> : null}

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-white/45 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Insignias</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Visitas</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-white/40">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/40">
                    No hay usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const blocked = Boolean(user.blockedAt);
                  const isAdmin = isAdminRole(user.role);
                  const busy = actionId === user.id;

                  return (
                    <tr key={user.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="font-medium">{user.displayName}</div>
                        <Link
                          href={`/${user.username}`}
                          target="_blank"
                          className="text-xs text-purple-400 hover:underline"
                        >
                          @{user.username}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-white/60">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isAdmin
                              ? "bg-red-500/15 text-red-300"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {user.badges.includes("verified") && (
                            <span title="Verificado">
                              <CheckCircle className="w-4 h-4 text-blue-400" />
                            </span>
                          )}
                          {user.badges.includes("owner") && (
                            <span title="Owner">
                              <Crown className="w-4 h-4 text-amber-400" />
                            </span>
                          )}
                          {!user.badges.length && (
                            <span className="text-xs text-white/25">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {blocked ? (
                          <span className="text-xs text-amber-300">Bloqueado</span>
                        ) : (
                          <span className="text-xs text-emerald-400/90">Activo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/50">{user.views}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end flex-wrap gap-1.5">
                          {!isAdmin ? (
                            <>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void toggleBadge(user.id, "verified")}
                                className={`inline-flex items-center gap-1 px-2 py-1.5 text-[11px] rounded-lg border disabled:opacity-50 ${
                                  user.badges.includes("verified")
                                    ? "border-blue-500/40 bg-blue-500/15 text-blue-300"
                                    : "border-white/10 text-white/50 hover:border-white/20"
                                }`}
                                title="Verificado"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void toggleBadge(user.id, "owner")}
                                className={`inline-flex items-center gap-1 px-2 py-1.5 text-[11px] rounded-lg border disabled:opacity-50 ${
                                  user.badges.includes("owner")
                                    ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                                    : "border-white/10 text-white/50 hover:border-white/20"
                                }`}
                                title="Owner"
                              >
                                <Crown className="w-3.5 h-3.5" />
                              </button>
                              {blocked ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void runAction(user.id, "unblock")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Desbloquear
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void runAction(user.id, "block")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-amber-600/20 text-amber-200 hover:bg-amber-600/30 disabled:opacity-50"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Bloquear
                              </button>
                              )}
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-white/10 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-xs text-white/40">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-white/10 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </div>
  );
}
