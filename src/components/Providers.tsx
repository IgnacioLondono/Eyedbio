"use client";

import { SessionProvider } from "next-auth/react";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import MediaGestureTracker from "@/components/MediaGestureTracker";
import type { AppLocale } from "@/lib/i18n/types";
import type { SiteSettingsConfig } from "@/lib/site-settings-config";

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
          {children}
        </SiteSettingsProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
