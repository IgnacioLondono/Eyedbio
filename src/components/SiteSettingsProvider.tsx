"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettingsConfig,
} from "@/lib/site-settings-config";

const SiteSettingsContext = createContext<SiteSettingsConfig>(DEFAULT_SITE_SETTINGS);

export function SiteSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettingsConfig;
}) {
  const [settings, setSettings] = useState<SiteSettingsConfig>(
    initialSettings ?? DEFAULT_SITE_SETTINGS
  );

  const reload = () => {
    fetch("/api/site-settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setSettings(data.settings as SiteSettingsConfig);
        }
      })
      .catch(() => {
        /* keep defaults */
      });
  };

  useEffect(() => {
    if (!initialSettings) reload();

    const onUpdate = () => reload();
    window.addEventListener("eyed:site-settings-updated", onUpdate);
    return () => window.removeEventListener("eyed:site-settings-updated", onUpdate);
  }, [initialSettings]);

  const value = useMemo(() => settings, [settings]);

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsConfig {
  return useContext(SiteSettingsContext);
}
