"use client";

import { useEffect, useState } from "react";
import { Save, Settings2 } from "lucide-react";
import {
  DEFAULT_SITE_SETTINGS,
  SITE_SETTING_KEYS,
  type SiteSettingsConfig,
} from "@/lib/site-settings-config";

const SETTING_META: Record<
  keyof SiteSettingsConfig,
  { label: string; description: string }
> = {
  showPublicUidInAccount: {
    label: "Serial (UID) en cuenta",
    description:
      "Muestra el identificador EYE-000001 en Ajustes de cuenta del dashboard. No aparece en el perfil público.",
  },
  allowLoginCodeByEmail: {
    label: "Código por correo al login",
    description:
      "Permite que cada usuario active el código de acceso por email en su cuenta. Si está desactivado, solo email y contraseña.",
  },
  profileReviewsEnabled: {
    label: "Reseñas de perfiles",
    description: "Activa reseñas en perfiles, landing y APIs relacionadas.",
  },
  claimProfileCtaEnabled: {
    label: "CTA «Crea tu perfil»",
    description: "Banner inferior en perfiles públicos para invitar a registrarse.",
  },
  communityDiscordEnabled: {
    label: "Enlaces a Discord",
    description: "Muestra el enlace a la comunidad en navbar, landing y dashboard.",
  },
  profileAudioEnabled: {
    label: "Audio en perfiles",
    description: "Permite subir y reproducir audio de fondo en perfiles.",
  },
  profileAccessCodeEnabled: {
    label: "Código de acceso al perfil",
    description:
      "Permite proteger el perfil público con un código. Si está off, los usuarios no pueden activarlo.",
  },
};

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsConfig>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSettings({ ...DEFAULT_SITE_SETTINGS, ...data.settings });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: keyof SiteSettingsConfig) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccess("");
  };

  const save = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");

      setSettings({ ...DEFAULT_SITE_SETTINGS, ...data.settings });
      setSuccess(data.message ?? "Guardado");
      window.dispatchEvent(new Event("eyed:site-settings-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="h-40 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-start gap-3 mb-8">
        <div className="p-2 rounded-lg bg-red-500/15 text-red-300">
          <Settings2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1">Configuración del sitio</h1>
          <p className="text-white/45 text-sm leading-relaxed">
            Activa o desactiva funciones para todos los usuarios. Los cambios se aplican al
            guardar.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {SITE_SETTING_KEYS.map((key) => {
          const meta = SETTING_META[key];
          return (
            <div
              key={key}
              className="flex items-start justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03]"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{meta.label}</p>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">{meta.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings[key]}
                onClick={() => toggle(key)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  settings[key] ? "bg-red-600" : "bg-white/10"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    settings[key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-2">
          {success}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-sm font-semibold transition-colors"
      >
        <Save className="w-4 h-4" />
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}
