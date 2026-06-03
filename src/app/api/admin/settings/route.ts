import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import {
  SITE_SETTING_KEYS,
  getSiteSettings,
  mergeSiteSettings,
  updateSiteSettings,
  type SiteSettingsConfig,
} from "@/lib/site-settings";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const patch: Partial<SiteSettingsConfig> = {};

    for (const key of SITE_SETTING_KEYS) {
      if (body[key] !== undefined) {
        patch[key] = Boolean(body[key]);
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No hay cambios para guardar" }, { status: 400 });
    }

    const settings = await updateSiteSettings(patch);
    return NextResponse.json({
      settings,
      message: "Configuración actualizada",
    });
  } catch (err) {
    console.error("[admin/settings PATCH]", err);
    return NextResponse.json({ error: "Error al guardar la configuración" }, { status: 500 });
  }
}
