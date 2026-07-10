"use client";

import { X } from "lucide-react";
import { t as translate } from "@/lib/i18n";

type Props = {
  open: boolean;
  displayUrl: string;
  locale: "es" | "en";
  onClose: () => void;
  onConfirm: () => void;
};

export default function ExternalLinkConfirmModal({
  open,
  displayUrl,
  locale,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="external-link-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label={translate(locale, "common.close")}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#12121a] px-6 py-7 shadow-2xl sm:px-8 sm:py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <h2 id="external-link-title" className="text-xl font-semibold text-white">
            {translate(locale, "profile.externalLinkTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/45 transition-colors hover:bg-white/5 hover:text-white"
            aria-label={translate(locale, "common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-center text-base text-white/90">
          {translate(locale, "profile.externalLinkMessage")}
        </p>

        <div className="mx-auto mt-4 max-w-md rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-center">
          <p className="truncate text-sm text-white/80 sm:text-base">{displayUrl}</p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onConfirm}
            className="min-w-[140px] rounded-full bg-[#7c3aed] px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
          >
            {translate(locale, "profile.externalLinkVisit")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[140px] rounded-full border border-white/10 bg-white/[0.06] px-8 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
          >
            {translate(locale, "common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
