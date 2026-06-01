import { en } from "./messages/en";
import { es } from "./messages/es";
import type { Messages } from "./messages/es";
import type { AppLocale } from "./types";
import { localeFromLanguageTag } from "./types";

export type { AppLocale };

const catalogs: Record<AppLocale, Messages> = { es, en };

export type { Messages };

export function getMessages(locale: AppLocale): Messages {
  return catalogs[locale] ?? es;
}

type Path = string;

export function t(locale: AppLocale, path: Path): string {
  const parts = path.split(".");
  let node: unknown = getMessages(locale);
  for (const part of parts) {
    if (node && typeof node === "object" && part in (node as object)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof node === "string" ? node : path;
}

export function tVars(
  locale: AppLocale,
  path: Path,
  vars: Record<string, string | number>
): string {
  let result = t(locale, path);
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }
  return result;
}

export function formatLocaleDate(
  locale: AppLocale,
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale === "en" ? "en-US" : "es-ES", options);
}

export const LOCALE_COOKIE = "eyed-locale";

export function readLocaleCookie(): AppLocale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  if (!match) return null;
  return match[1] === "en" ? "en" : match[1] === "es" ? "es" : null;
}

export function writeLocaleCookie(locale: AppLocale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}

/** Idioma del navegador/dispositivo (solo cliente). */
export function detectBrowserLocale(): AppLocale {
  if (typeof navigator === "undefined") return "es";

  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const tag of languages) {
    const locale = localeFromLanguageTag(tag);
    if (locale === "en") return "en";
    if (tag.toLowerCase().startsWith("es")) return "es";
  }

  return localeFromLanguageTag(navigator.language);
}

/** Cookie guardada = preferencia explícita; si no hay, usar idioma del sistema. */
export function resolveClientLocale(fallback?: AppLocale): AppLocale {
  return readLocaleCookie() ?? fallback ?? detectBrowserLocale();
}
