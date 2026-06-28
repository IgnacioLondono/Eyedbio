import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SITE_SETTINGS,
  mergeSiteSettings,
  type SiteSettingsConfig,
} from "@/lib/config/site-settings-config";

export type { SiteSettingsConfig } from "@/lib/config/site-settings-config";
export {
  DEFAULT_SITE_SETTINGS,
  mergeSiteSettings,
  SITE_SETTING_KEYS,
} from "@/lib/config/site-settings-config";

const SITE_SETTINGS_ID = "default";

let cachedSettings: SiteSettingsConfig | null = null;
let cacheExpiresAt = 0;
const CACHE_MS = 5_000;

function parseConfig(raw: string): Partial<SiteSettingsConfig> {
  try {
    const parsed = JSON.parse(raw) as Partial<SiteSettingsConfig>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function invalidateSiteSettingsCache(): void {
  cachedSettings = null;
  cacheExpiresAt = 0;
}

export async function getSiteSettings(): Promise<SiteSettingsConfig> {
  const now = Date.now();
  if (cachedSettings && cacheExpiresAt > now) {
    return cachedSettings;
  }

  const row = await prisma.siteSettings.findUnique({
    where: { id: SITE_SETTINGS_ID },
    select: { config: true },
  });

  const merged = mergeSiteSettings(row ? parseConfig(row.config) : undefined);
  cachedSettings = merged;
  cacheExpiresAt = now + CACHE_MS;
  return merged;
}

export async function updateSiteSettings(
  patch: Partial<SiteSettingsConfig>
): Promise<SiteSettingsConfig> {
  const current = await getSiteSettings();
  const next = mergeSiteSettings({ ...current, ...patch });

  await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: {
      id: SITE_SETTINGS_ID,
      config: JSON.stringify(next),
    },
    update: {
      config: JSON.stringify(next),
    },
  });

  invalidateSiteSettingsCache();
  return next;
}
