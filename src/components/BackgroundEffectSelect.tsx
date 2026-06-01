"use client";

import type { BackgroundEffect } from "@/types/profile";
import { BACKGROUND_EFFECT_CATEGORIES, categoryLabel, effectLabel } from "@/lib/background-effects-config";
import { useI18n } from "@/components/LocaleProvider";

interface Props {
  value: BackgroundEffect;
  onChange: (value: BackgroundEffect) => void;
}

export default function BackgroundEffectSelect({ value, onChange }: Props) {
  const { locale } = useI18n();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as BackgroundEffect)}
      className="input-field"
    >
      {BACKGROUND_EFFECT_CATEGORIES.map((category) => (
        <optgroup key={category.id} label={categoryLabel(category, locale)}>
          {category.effects.map((effect) => (
            <option key={effect.value} value={effect.value}>
              {effectLabel(effect.value, locale)}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
