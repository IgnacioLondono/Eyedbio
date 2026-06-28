"use client";

import { SessionProvider } from "next-auth/react";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";
import MediaGestureTracker from "@/components/media/MediaGestureTracker";
import NavigationSync from "@/components/layout/NavigationSync";
import type { AppLocale } from "@/lib/i18n/types";
import type { SiteSettingsConfig } from "@/lib/config/site-settings-config";

export default function Providers({
  children,
  initialLocale,
  initialSiteSettings,
}: {
  children: React.ReactNode;
  initialLocale: AppLocale;
  initialSiteSettings?: SiteSettingsConfig;
}) {
  return (
    <SessionProvider>
      <LocaleProvider initialLocale={initialLocale}>
        <SiteSettingsProvider initialSettings={initialSiteSettings}>
          <MediaGestureTracker />
          <NavigationSync />
          {children}
        </SiteSettingsProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
