"use client";

import { Info } from "lucide-react";
import { useI18n } from "@/components/providers/LocaleProvider";

export default function FuturePaymentsNotice({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div
      className={`flex gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-50/95 ${className}`}
      role="status"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" strokeWidth={2} />
      <p className="leading-relaxed">{t("marketplace.paymentsNotice")}</p>
    </div>
  );
}
