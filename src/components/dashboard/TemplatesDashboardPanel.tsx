"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Store, Upload } from "lucide-react";
import FuturePaymentsNotice from "@/components/marketplace/FuturePaymentsNotice";
import type { Profile } from "@/types/profile";
import type { TemplatePublic } from "@/lib/templates/template-service";
import { useI18n } from "@/components/providers/LocaleProvider";
import { ACCEPT_ATTR } from "@/lib/media/media-config";

export default function TemplatesDashboardPanel({ profile }: { profile: Profile }) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publish, setPublish] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mine, setMine] = useState<TemplatePublic[]>([]);

  const loadMine = useCallback(async () => {
    const res = await fetch("/api/templates?mine=1");
    if (!res.ok) return;
    const data = await res.json();
    const list = Array.isArray(data.templates) ? (data.templates as TemplatePublic[]) : [];
    setMine(list.filter((tpl) => !tpl.official));
  }, []);

  useEffect(() => {
    void loadMine();
  }, [loadMine]);

  const uploadPreview = async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    form.set("kind", "templatePreview");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : t("marketplace.uploadPreviewError"));
    }
    setPreviewUrl(typeof data.url === "string" ? data.url : null);
  };

  const saveTemplate = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          publish,
          previewUrl,
          category: "community",
          settings: profile.settings,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : t("marketplace.saveError"));
      }
      setTitle("");
      setDescription("");
      setPreviewUrl(null);
      setMessage(t("marketplace.saveSuccess"));
      void loadMine();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t("marketplace.saveError"));
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (id: string, published: boolean) => {
    const res = await fetch(`/api/templates/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });
    if (res.ok) void loadMine();
  };

  return (
    <div className="space-y-6">
      <FuturePaymentsNotice />

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              {t("marketplace.saveCurrentTitle")}
            </h2>
            <p className="mt-1 text-sm text-white/55">{t("marketplace.saveCurrentHint")}</p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
          >
            <Store className="h-3.5 w-3.5" />
            {t("marketplace.openMarket")}
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-white/70">
            {t("marketplace.formTitle")}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-white/25"
              maxLength={80}
            />
          </label>
          <label className="block text-sm text-white/70">
            {t("marketplace.formPreview")}
            <input
              type="file"
              accept={ACCEPT_ATTR.templatePreview}
              className="mt-1 block w-full text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void uploadPreview(file).catch((err) =>
                  setMessage(err instanceof Error ? err.message : t("marketplace.uploadPreviewError"))
                );
              }}
            />
          </label>
        </div>

        <label className="mt-3 block text-sm text-white/70">
          {t("marketplace.formDescription")}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={280}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-white/25"
          />
        </label>

        <label className="mt-3 flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className="rounded border-white/20"
          />
          {t("marketplace.publishNow")}
        </label>

        {previewUrl ? (
          <p className="mt-2 text-xs text-emerald-300/90">{t("marketplace.previewReady")}</p>
        ) : null}

        <button
          type="button"
          disabled={busy || title.trim().length < 2}
          onClick={() => void saveTemplate()}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {busy ? t("marketplace.saving") : t("marketplace.saveButton")}
        </button>

        {message ? <p className="mt-3 text-sm text-white/70">{message}</p> : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
          {t("marketplace.myTemplates")}
        </h3>
        {mine.length === 0 ? (
          <p className="text-sm text-white/45">{t("marketplace.myTemplatesEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {mine.map((tpl) => (
              <li
                key={tpl.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-white">{tpl.title}</p>
                  <p className="text-xs text-white/45">
                    {tpl.published ? t("marketplace.published") : t("marketplace.draft")} ·{" "}
                    {tpl.installs} {t("marketplace.installs")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void togglePublish(tpl.id, !tpl.published)}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  {tpl.published ? t("marketplace.unpublish") : t("marketplace.publish")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
