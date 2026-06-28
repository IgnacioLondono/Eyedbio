"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Send, CircleX, RotateCcw } from "lucide-react";
import {
  SUPPORT_STATUSES,
  supportCategoryLabel,
  supportStatusLabel,
  supportStatusTone,
  type SupportStatus,
} from "@/lib/config/support-config";
import type { AdminSupportTicketRow } from "@/types/support";
import { useIntervalWhenVisible } from "@/hooks/useIntervalWhenVisible";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function AdminSupportQueue() {
  const [tickets, setTickets] = useState<AdminSupportTicketRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchDetail>> | null>(null);
  const [statusFilter, setStatusFilter] = useState("active");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function fetchDetail(id: string) {
    const res = await fetch(`/api/admin/support/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error");
    return data.ticket as AdminSupportTicketRow & {
      messages: {
        id: string;
        authorId: string | null;
        isStaff: boolean;
        body: string;
        createdAt: string;
      }[];
    };
  }

  const loadList = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    if (!silent) setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        status: statusFilter,
      });
      if (query) params.set("q", query);

      const res = await fetch(`/api/admin/support?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar");

      setTickets(data.tickets ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Error");
        setTickets([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, query, statusFilter]);

  const loadDetail = useCallback(async (id: string, silent = false) => {
    if (!silent) setDetailLoading(true);
    if (!silent) setError("");
    try {
      const ticket = await fetchDetail(id);
      setDetail(ticket);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Error");
        setDetail(null);
      }
    } finally {
      if (!silent) setDetailLoading(false);
    }
  }, []);

  const pollDetail = useCallback(() => {
    if (selectedId && !saving) void loadDetail(selectedId, true);
  }, [selectedId, saving, loadDetail]);

  const pollList = useCallback(() => {
    if (!saving) void loadList(true);
  }, [saving, loadList]);

  useIntervalWhenVisible(pollDetail, 3000, Boolean(selectedId));
  useIntervalWhenVisible(pollList, 8000, true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages.length, detail?.messages.at(-1)?.id]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  const updateTicket = async (patch: { status?: SupportStatus; reply?: string }) => {
    if (!selectedId) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/support/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");

      setDetail(data.ticket);
      setReply("");
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const closeTicket = async (withReply = false) => {
    if (!selectedId || detail?.status === "closed") return;

    const message = withReply
      ? "¿Enviar la respuesta y cerrar el ticket? El usuario no podrá escribir más."
      : "¿Cerrar este ticket? El usuario no podrá enviar más mensajes.";

    if (!window.confirm(message)) return;

    if (withReply && reply.trim()) {
      await updateTicket({ reply: reply.trim(), status: "closed" });
    } else {
      await updateTicket({ status: "closed" });
    }
  };

  const reopenTicket = async () => {
    if (!selectedId || detail?.status !== "closed") return;
    await updateTicket({ status: "in_progress" });
  };

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col lg:flex-row gap-2"
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
            placeholder="Buscar por asunto, email o usuario…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-500/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm"
        >
          <option value="active">Activos (abiertos y en revisión)</option>
          <option value="all">Todos los estados</option>
          {SUPPORT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {supportStatusLabel(s, "es")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-medium"
        >
          Buscar
        </button>
      </form>

      {error ? <p className="text-red-400 text-sm">{error}</p> : null}

      <div className="grid xl:grid-cols-[minmax(0,360px)_1fr] gap-4 min-h-[520px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
            Cola de tickets
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
              </div>
            ) : tickets.length === 0 ? (
              <p className="px-4 py-10 text-sm text-white/40 text-center">Sin tickets</p>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket.id)}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/[0.03] ${
                    selectedId === ticket.id ? "bg-red-500/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate">{ticket.subject}</p>
                    <span
                      className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border ${supportStatusTone(ticket.status)}`}
                    >
                      {supportStatusLabel(ticket.status, "es")}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-1 truncate">
                    {ticket.user.displayName} · @{ticket.user.username}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1">{formatWhen(ticket.updatedAt)}</p>
                </button>
              ))
            )}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 p-3 border-t border-white/10">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-2 py-1 text-xs rounded border border-white/10 disabled:opacity-40"
              >
                ←
              </button>
              <span className="text-xs text-white/40">
                {page}/{totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2 py-1 text-xs rounded border border-white/10 disabled:opacity-40"
              >
                →
              </button>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col min-h-[400px]">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-white/35 text-sm p-8 text-center">
              Selecciona un ticket para responder o cambiar su estado.
            </div>
          ) : detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white/30" />
            </div>
          ) : detail ? (
            <>
              <div className="px-4 py-4 border-b border-white/10 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-white/35">
                    {supportCategoryLabel(detail.category, "es")}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full border ${supportStatusTone(detail.status)}`}
                  >
                    {supportStatusLabel(detail.status, "es")}
                  </span>
                </div>
                <h2 className="text-lg font-semibold">{detail.subject}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/45">
                  <span>{detail.user.email}</span>
                  <Link
                    href={`/${detail.user.username}`}
                    target="_blank"
                    className="text-purple-400 hover:underline"
                  >
                    @{detail.user.username}
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {detail.status !== "closed" ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void closeTicket(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <CircleX className="w-3.5 h-3.5" />
                      Cerrar ticket
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void reopenTicket()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reabrir ticket
                    </button>
                  )}
                  {SUPPORT_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={saving || detail.status === status}
                      onClick={() => void updateTicket({ status })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] border disabled:opacity-40 ${
                        detail.status === status
                          ? supportStatusTone(status)
                          : "border-white/10 text-white/50 hover:border-white/20"
                      }`}
                    >
                      {supportStatusLabel(status, "es")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {detail.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[90%] rounded-xl px-3 py-2.5 text-sm border ${
                      msg.isStaff
                        ? "bg-red-500/10 border-red-500/20 mr-auto"
                        : "bg-white/5 border-white/10 ml-auto"
                    }`}
                  >
                    <p className="text-[10px] text-white/40 mb-1">
                      {msg.isStaff ? "Staff" : "Usuario"} · {formatWhen(msg.createdAt)}
                    </p>
                    <p className="whitespace-pre-wrap text-white/85">{msg.body}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {detail.status !== "closed" ? (
                <div className="p-4 border-t border-white/10 space-y-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Respuesta al usuario…"
                    className="w-full min-h-[80px] rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm resize-y focus:outline-none focus:border-red-500/40"
                    maxLength={4000}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={saving || !reply.trim()}
                      onClick={() => void updateTicket({ reply })}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-medium disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Enviar respuesta
                    </button>
                    <button
                      type="button"
                      disabled={saving || !reply.trim()}
                      onClick={() => void closeTicket(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-medium text-white/80 disabled:opacity-50"
                    >
                      <CircleX className="w-4 h-4" />
                      Responder y cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="p-4 border-t border-white/10 text-xs text-white/40 text-center">
                  Ticket cerrado. El usuario ya no puede enviar mensajes.
                </p>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
