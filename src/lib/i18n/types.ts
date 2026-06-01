export type AppLocale = "es" | "en";

export const APP_LOCALES: AppLocale[] = ["es", "en"];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  es: "Español",
  en: "English",
};

export function parseLocale(value: unknown): AppLocale {
  return value === "en" ? "en" : "es";
}

export function localeFromAcceptLanguage(header: string | null): AppLocale {
  if (!header) return "es";
  return header.toLowerCase().includes("en") ? "en" : "es";
}
