"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  MessageSquarePlus,
  Send,
  LifeBuoy,
} from "lucide-react";
import { useI18n } from "@/components/LocaleProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import {
  SUPPORT_CATEGORIES,
  supportCategoryLabel,
  supportStatusLabel,
  supportStatusTone,
  type SupportCategory,
} from "@/lib/support-config";
import type { SupportTicketDetail, SupportTicketSummary } from "@/types/support";
import { COMMUNITY_DISCORD_URL } from "@/lib/community";
import { useIntervalWhenVisible } from "@/hooks/useIntervalWhenVisible";

function formatWhen(iso: string, locale: "es" | "en") {
  return new Date(iso).toLocaleString(locale === "es" ? "es-ES" : "en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function SupportCenter() {
  const { t, locale } = useI18n();
  const site = useSiteSettings();
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupportTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({
    category: "other" as SupportCategory,
    subject: "",
    message: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/support");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("support.loadError"));
      setTickets(data.tickets ?? []);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : t("support.loadError"));
        setTickets([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [t]);

  const loadDetail = useCallback(
    async (id: string, silent = false) => {
      if (!silent) setDetailLoading(true);
      if (!silent) setError("");
      try {
        const res = await fetch(`/api/support/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? t("support.loadError"));
        setDetail(data.ticket);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : t("support.loadError"));
          setDetail(null);
        }
      } finally {
        if (!silent) setDetailLoading(false);
      }
    },
    [t]
  );

  const pollDetail = useCallback(() => {
    if (selectedId && !sending) void loadDetail(selectedId, true);
  }, [selectedId, sending, loadDetail]);

  const pollTickets = useCallback(() => {
    if (!creating) void loadTickets(true);
  }, [creating, loadTickets]);

  useIntervalWhenVisible(pollDetail, 3000, Boolean(selectedId) && site.supportEnabled);
  useIntervalWhenVisible(pollTickets, 8000, site.supportEnabled);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages.length, detail?.messages.at(-1)?.id]);

  useEffect(() => {
    if (!site.supportEnabled) {
      setLoading(false);
      return;
    }
    void loadTickets();
  }, [loadTickets, site.supportEnabled]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("support.createError"));

      setShowForm(false);
      setForm({ category: "other", subject: "", message: "" });
      await loadTickets();
      if (data.ticket?.id) {
        setSelectedId(data.ticket.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("support.createError"));
    } finally {
      setCreating(false);
    }
  };

  const sendReply = async () => {
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/support/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("support.replyError"));

      setReply("");
      setDetail(data.ticket);
      await loadTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("support.replyError"));
    } finally {
      setSending(false);
    }
  };

  if (!site.supportEnabled) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-white/60">{t("support.disabled")}</p>
        {site.communityDiscordEnabled ? (
          <a
            href={COMMUNITY_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm text-purple-400 hover:text-purple-300"
          >
            {t("support.discordFallback")} →
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-purple-400" />
            {t("support.title")}
          </h1>
          <p className="text-white/45 text-sm mt-1">{t("support.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-medium"
        >
          <MessageSquarePlus className="w-4 h-4" />
          {t("support.newTicket")}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={(e) => void createTicket(e)}
          className="rounded-2xl border border-purple-500/25 bg-purple-500/5 p-5 space-y-4"
        >
          <p className="text-sm font-medium text-white">{t("support.newTicket")}</p>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">{t("support.category")}</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as SupportCategory }))
              }
              className="input-field w-full"
            >
              {SUPPORT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {supportCategoryLabel(cat, locale)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">{t("support.subject")}</label>
            <input
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="input-field w-full"
              placeholder={t("support.subjectPlaceholder")}
              maxLength={120}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">{t("support.message")}</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="input-field w-full min-h-[120px] resize-y"
              placeholder={t("support.messagePlaceholder")}
              maxLength={4000}
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-white/10 text-sm text-white/70"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-medium disabled:opacity-50"
            >
              {creating ? t("support.sending") : t("support.submit")}
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2">
          {error}
        </p>
      ) : null}

      <div className="grid lg:grid-cols-[minmax(0,320px)_1fr] gap-4 min-h-[420px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
            {t("support.yourTickets")}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
              </div>
            ) : tickets.length === 0 ? (
              <p className="px-4 py-8 text-sm text-white/40 text-center">{t("support.empty")}</p>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket.id)}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors ${
                    selectedId === ticket.id ? "bg-purple-500/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate">{ticket.subject}</p>
                    <span
                      className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border ${supportStatusTone(ticket.status)}`}
                    >
                      {supportStatusLabel(ticket.status, locale)}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/35 mt-1 truncate">{ticket.lastMessagePreview}</p>
                  <p className="text-[10px] text-white/25 mt-1">
                    {formatWhen(ticket.updatedAt, locale)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col min-h-[320px]">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-white/35 text-sm">
              {t("support.selectTicket")}
            </div>
          ) : detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white/30" />
            </div>
          ) : detail ? (
            <>
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wide text-white/35">
                    {supportCategoryLabel(detail.category, locale)}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full border ${supportStatusTone(detail.status)}`}
                  >
                    {supportStatusLabel(detail.status, locale)}
                  </span>
                </div>
                <h2 className="font-semibold">{detail.subject}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {detail.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[92%] rounded-xl px-3 py-2.5 text-sm ${
                      msg.isStaff
                        ? "bg-purple-500/15 border border-purple-500/20 ml-0 mr-auto"
                        : "bg-white/5 border border-white/10 ml-auto mr-0"
                    }`}
                  >
                    <p className="text-[10px] font-medium mb-1 text-white/45">
                      {msg.isStaff ? t("support.staff") : t("support.you")} ·{" "}
                      {formatWhen(msg.createdAt, locale)}
                    </p>
                    <p className="whitespace-pre-wrap text-white/85">{msg.body}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {detail.status !== "closed" ? (
                <div className="p-4 border-t border-white/10 flex gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={t("support.replyPlaceholder")}
                    className="input-field flex-1 min-h-[44px] max-h-32 resize-y text-sm"
                    maxLength={4000}
                  />
                  <button
                    type="button"
                    disabled={sending || !reply.trim()}
                    onClick={() => void sendReply()}
                    className="self-end p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
                    aria-label={t("support.send")}
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ) : (
                <p className="p-4 border-t border-white/10 text-xs text-white/40 text-center">
                  {t("support.closedHint")}
                </p>
              )}
            </>
          ) : null}
        </div>
      </div>

      {site.communityDiscordEnabled ? (
        <p className="text-xs text-white/35 text-center">
          {t("support.discordAlso")}{" "}
          <a
            href={COMMUNITY_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300"
          >
            Discord
          </a>
        </p>
      ) : null}
    </div>
  );
}
