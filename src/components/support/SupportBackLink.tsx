"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/components/providers/LocaleProvider";

export default function SupportBackLink() {
  const { t } = useI18n();

  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      {t("nav.goDashboard")}
    </Link>
  );
}
