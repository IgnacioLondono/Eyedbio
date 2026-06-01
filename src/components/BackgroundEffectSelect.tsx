"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { BackgroundEffect } from "@/types/profile";
import {
  BACKGROUND_EFFECT_CATEGORIES,
  categoryLabel,
  effectCategoryFor,
  effectLabel,
} from "@/lib/background-effects-config";
import { useI18n } from "@/components/LocaleProvider";

interface Props {
  value: BackgroundEffect;
  onChange: (value: BackgroundEffect) => void;
}

export default function BackgroundEffectSelect({ value, onChange }: Props) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const select = (effect: BackgroundEffect) => {
    onChange(effect);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="input-field flex items-center justify-between gap-2 text-left"
      >
        <span className="min-w-0 truncate">
          <span className="text-white/45 text-xs mr-1.5">
            {effectCategoryFor(value, locale)} ·
          </span>
          {effectLabel(value, locale)}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={t("dashboard.backgroundEffect")}
          className="absolute z-50 mt-1.5 w-full max-h-[min(320px,50vh)] overflow-y-auto rounded-xl border border-white/10 bg-[#12121a] shadow-xl shadow-black/40 [scrollbar-width:thin]"
        >
          {BACKGROUND_EFFECT_CATEGORIES.map((category, index) => (
            <div key={category.id}>
              {index > 0 && <div className="mx-3 border-t border-white/10" aria-hidden />}
              <p className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-wider text-white/35 font-medium sticky top-0 bg-[#12121a]/95 backdrop-blur-sm">
                {categoryLabel(category, locale)}
              </p>
              <ul className="pb-1">
                {category.effects.map((effect) => {
                  const active = value === effect.value;
                  return (
                    <li key={effect.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => select(effect.value)}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? "bg-purple-500/20 text-purple-200"
                            : "text-white/80 hover:bg-white/5"
                        }`}
                      >
                        {effect.label[locale]}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
