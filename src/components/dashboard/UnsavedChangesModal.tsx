"use client";

import { useI18n } from "@/components/providers/LocaleProvider";

interface Props {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onViewWithoutSave: () => void;
  onSaveAndView: () => void;
}

export default function UnsavedChangesModal({
  open,
  saving,
  onClose,
  onViewWithoutSave,
  onSaveAndView,
}: Props) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("common.close")}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-2xl">
        <h2 id="unsaved-title" className="text-lg font-semibold text-white">
          {t("dashboard.unsavedTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/50">{t("dashboard.unsavedBody")}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            {t("dashboard.keepEditing")}
          </button>
          <button
            type="button"
            onClick={onViewWithoutSave}
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
          >
            {t("dashboard.viewWithoutSave")}
          </button>
          <button
            type="button"
            onClick={onSaveAndView}
            disabled={saving}
            className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-purple-500 disabled:opacity-50"
          >
            {saving ? t("dashboard.saving") : t("dashboard.saveAndView")}
          </button>
        </div>
      </div>
    </div>
  );
}
