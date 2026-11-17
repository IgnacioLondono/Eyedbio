"use client";

import { Download, Sparkles, Star } from "lucide-react";
import type { TemplatePublic } from "@/lib/templates/template-service";
import { getMediaSrc } from "@/lib/media/media-url";
import { useI18n } from "@/components/providers/LocaleProvider";

export default function TemplateCard({
  template,
  applyingId,
  onApply,
}: {
  template: TemplatePublic;
  applyingId: string | null;
  onApply: (id: string) => void;
}) {
  const { t } = useI18n();
  const busy = applyingId === template.id;
  const accent =
    typeof template.settings.accentColor === "string"
      ? template.settings.accentColor
      : "#a855f7";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-lg shadow-black/20 transition hover:border-white/20 hover:bg-white/[0.05]">
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${accent}55 0%, #0a0a0f 55%, #111827 100%)`,
        }}
      >
        {template.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getMediaSrc(template.previewUrl)}
            alt=""
            className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-24 w-40 rounded-xl border border-white/20 bg-black/35 shadow-xl backdrop-blur-md"
              style={{ boxShadow: `0 0 40px ${accent}33` }}
            />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {template.official ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
              <Sparkles className="h-3 w-3 text-amber-300" />
              {t("marketplace.official")}
            </span>
          ) : null}
          {template.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100 backdrop-blur">
              <Star className="h-3 w-3" />
              {t("marketplace.featured")}
            </span>
          ) : null}
          <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/80 backdrop-blur">
            {t("marketplace.free")}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight text-white">
            {template.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/55">{template.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            {template.layout} · {template.installs.toLocaleString()} {t("marketplace.installs")}
          </p>
          <button
            type="button"
            disabled={busy || applyingId !== null}
            onClick={() => onApply(template.id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            {busy ? t("marketplace.applying") : t("marketplace.apply")}
          </button>
        </div>
      </div>
    </article>
  );
}
