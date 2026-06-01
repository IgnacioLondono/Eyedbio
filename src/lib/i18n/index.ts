import { en } from "./messages/en";
import { es } from "./messages/es";
import type { Messages } from "./messages/es";
import type { AppLocale } from "./types";

const catalogs: Record<AppLocale, Messages> = { es, en };

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
