export type AppLocale = "es" | "en";

export const APP_LOCALES: AppLocale[] = ["es", "en"];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  es: "Español",
  en: "English",
};

export function parseLocale(value: unknown): AppLocale {
  return value === "en" ? "en" : "es";
}

/** Mapea una etiqueta BCP 47 (p. ej. en-US, es-ES) al locale soportado. */
export function localeFromLanguageTag(tag: string | null | undefined): AppLocale {
  if (!tag) return "es";
  const primary = tag.trim().split("-")[0]?.toLowerCase();
  return primary === "en" ? "en" : "es";
}

export function localeFromAcceptLanguage(header: string | null): AppLocale {
  if (!header) return "es";

  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim();
    if (!tag) continue;
    const locale = localeFromLanguageTag(tag);
    if (locale === "en") return "en";
    // Preferir el primer idioma listado; si es es-* u otro, seguir buscando en
    if (tag.toLowerCase().startsWith("es")) return "es";
  }

  const first = header.split(",")[0]?.split(";")[0]?.trim();
  return localeFromLanguageTag(first);
}
