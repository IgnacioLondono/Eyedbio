import type { BackgroundEffect } from "@/types/profile";
import type { AppLocale } from "@/lib/i18n/types";

export interface EffectOption {
  value: BackgroundEffect;
  label: { es: string; en: string };
}

export interface EffectCategory {
  id: string;
  label: { es: string; en: string };
  effects: EffectOption[];
}

export const BACKGROUND_EFFECT_CATEGORIES: EffectCategory[] = [
  {
    id: "none",
    label: { es: "Sin efecto", en: "No effect" },
    effects: [{ value: "none", label: { es: "Ninguno", en: "None" } }],
  },
  {
    id: "weather",
    label: { es: "Clima", en: "Weather" },
    effects: [
      { value: "snow", label: { es: "Nieve", en: "Snow" } },
      { value: "rain", label: { es: "Lluvia", en: "Rain" } },
    ],
  },
  {
    id: "nature",
    label: { es: "Naturaleza", en: "Nature" },
    effects: [
      { value: "fireflies", label: { es: "Luciérnagas", en: "Fireflies" } },
      { value: "aurora", label: { es: "Aurora", en: "Aurora" } },
      { value: "bubbles", label: { es: "Burbujas", en: "Bubbles" } },
    ],
  },
  {
    id: "space",
    label: { es: "Espacio", en: "Space" },
    effects: [
      { value: "stars", label: { es: "Estrellas", en: "Stars" } },
      { value: "nebula", label: { es: "Nebulosa", en: "Nebula" } },
      { value: "galaxy", label: { es: "Galaxia", en: "Galaxy" } },
      { value: "comets", label: { es: "Cometas", en: "Comets" } },
      { value: "meteors", label: { es: "Meteoros", en: "Meteors" } },
      { value: "cosmic_dust", label: { es: "Polvo cósmico", en: "Cosmic dust" } },
      { value: "satellites", label: { es: "Satélites", en: "Satellites" } },
    ],
  },
];

const ALL_EFFECTS = new Set<BackgroundEffect>(
  BACKGROUND_EFFECT_CATEGORIES.flatMap((c) => c.effects.map((e) => e.value))
);

export function resolveBackgroundEffect(value: unknown): BackgroundEffect {
  if (typeof value === "string" && ALL_EFFECTS.has(value as BackgroundEffect)) {
    return value as BackgroundEffect;
  }
  return "stars";
}

export function effectLabel(value: BackgroundEffect, locale: AppLocale): string {
  for (const cat of BACKGROUND_EFFECT_CATEGORIES) {
    const found = cat.effects.find((e) => e.value === value);
    if (found) return found.label[locale];
  }
  return value;
}

export function categoryLabel(category: EffectCategory, locale: AppLocale): string {
  return category.label[locale];
}

export function effectCategoryFor(value: BackgroundEffect, locale: AppLocale): string {
  for (const cat of BACKGROUND_EFFECT_CATEGORIES) {
    if (cat.effects.some((e) => e.value === value)) {
      return categoryLabel(cat, locale);
    }
  }
  return categoryLabel(BACKGROUND_EFFECT_CATEGORIES[0], locale);
}
