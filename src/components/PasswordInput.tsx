"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useI18n } from "@/components/LocaleProvider";

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  variant?: "auth" | "dashboard";
}

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete,
  required,
  minLength,
  variant = "auth",
}: Props) {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();
  const inputClass =
    variant === "dashboard" ? "input-field input-field--password" : "auth-input";

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className={`${inputClass} w-full`}
      />
      {variant === "dashboard" && (
        <KeyRound
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/70 pointer-events-none z-[1]"
          aria-hidden
        />
      )}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-[1] p-0.5 text-white/45 hover:text-white/80 transition-colors"
        aria-label={visible ? t("common.hidePassword") : t("common.showPassword")}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
      </button>
    </div>
  );
}
