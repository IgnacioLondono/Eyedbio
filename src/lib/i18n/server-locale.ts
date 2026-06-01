import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE } from "@/lib/i18n";
import { localeFromAcceptLanguage, type AppLocale } from "@/lib/i18n/types";

/** Locale para SSR: cookie explícita del usuario o idioma del sistema (Accept-Language). */
export async function resolveServerLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(LOCALE_COOKIE)?.value;
  if (cookieVal === "en" || cookieVal === "es") return cookieVal;

  const headerStore = await headers();
  return localeFromAcceptLanguage(headerStore.get("accept-language"));
}
