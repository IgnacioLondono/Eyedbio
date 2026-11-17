"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, Store } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import FuturePaymentsNotice from "@/components/marketplace/FuturePaymentsNotice";
import TemplateCard from "@/components/marketplace/TemplateCard";
import type { TemplatePublic } from "@/lib/templates/template-service";
import { useI18n } from "@/components/providers/LocaleProvider";

const CATEGORIES = ["all", "dark", "glass", "bold", "links", "compact", "classic", "community"] as const;

export default function MarketplacePageClient() {
  const { t } = useI18n();
  const { status } = useSession();
  const [templates, setTemplates] = useState<TemplatePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/templates?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : t("marketplace.loadError"));
      }
      const data = await res.json();
      setTemplates(Array.isArray(data.templates) ? data.templates : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("marketplace.loadError"));
    } finally {
      setLoading(false);
    }
  }, [category, q, t]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load();
    }, 180);
    return () => window.clearTimeout(handle);
  }, [load]);

  const onApply = async (id: string) => {
    if (status !== "authenticated") {
      window.location.href = `/login?callbackUrl=${encodeURIComponent("/marketplace")}`;
      return;
    }
    setApplyingId(id);
    setToast(null);
    try {
      const res = await fetch(`/api/templates/${id}/apply`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : t("marketplace.applyError"));
      }
      setToast(t("marketplace.applySuccess"));
      void load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : t("marketplace.applyError"));
    } finally {
      setApplyingId(null);
    }
  };

  const categoryLabel = useMemo(
    () =>
      ({
        all: t("marketplace.catAll"),
        dark: t("marketplace.catDark"),
        glass: t("marketplace.catGlass"),
        bold: t("marketplace.catBold"),
        links: t("marketplace.catLinks"),
        compact: t("marketplace.catCompact"),
        classic: t("marketplace.catClassic"),
        community: t("marketplace.catCommunity"),
      }) as Record<(typeof CATEGORIES)[number], string>,
    [t]
  );

  return (
    <div className="min-h-[100dvh] bg-[#07060b] text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(56,189,248,0.08),_transparent_45%)]"
      />
      <Navbar variant="app" />
      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/60">
            <Store className="h-3.5 w-3.5" />
            {t("marketplace.badge")}
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("marketplace.title")}
          </h1>
          <p className="mt-3 text-base text-white/60 sm:text-lg">{t("marketplace.subtitle")}</p>
        </header>

        <FuturePaymentsNotice className="mb-8" />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("marketplace.searchPlaceholder")}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none ring-0 placeholder:text-white/35 focus:border-white/25"
            />
          </div>
          <Link
            href="/dashboard?tab=customize&sub=templates"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
          >
            {t("marketplace.uploadCta")}
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                category === cat
                  ? "bg-white text-zinc-900"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {categoryLabel[cat]}
            </button>
          ))}
        </div>

        {toast ? (
          <p className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            {toast}
          </p>
        ) : null}

        {loading ? (
          <p className="text-white/50">{t("marketplace.loading")}</p>
        ) : error ? (
          <p className="text-red-300">{error}</p>
        ) : templates.length === 0 ? (
          <p className="text-white/50">{t("marketplace.empty")}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                applyingId={applyingId}
                onApply={onApply}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
