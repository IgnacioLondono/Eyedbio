"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { t as translate, readLocaleCookie, writeLocaleCookie } from "@/lib/i18n";
import type { AppLocale } from "@/lib/i18n/types";
import { parseLocale } from "@/lib/i18n/types";

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale, persist?: boolean) => Promise<void>;
  t: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: AppLocale;
}) {
  const { status } = useSession();
  const [locale, setLocaleState] = useState<AppLocale>(
    initialLocale ?? readLocaleCookie() ?? "es"
  );

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.locale) {
          const next = parseLocale(data.locale);
          setLocaleState(next);
          writeLocaleCookie(next);
        }
      })
      .catch(() => {});
  }, [status]);

  const setLocale = useCallback(
    async (next: AppLocale, persist = true) => {
      setLocaleState(next);
      writeLocaleCookie(next);
      document.documentElement.lang = next;

      if (!persist || status !== "authenticated") return;

      await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      }).catch(() => {});
    },
    [status]
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (path: string) => translate(locale, path),
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: "es" as AppLocale,
      setLocale: async () => {},
      t: (path: string) => translate("es", path),
    };
  }
  return ctx;
}

/** Usa el locale del perfil público cuando está disponible. */
export function useProfileLocale(profileLocale?: AppLocale) {
  const { locale: uiLocale, t } = useI18n();
  const locale = profileLocale ?? uiLocale;
  return {
    locale,
    t: (path: string) => translate(locale, path),
  };
}
