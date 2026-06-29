"use client";

import { useEffect, useState } from "react";
import { Save, Settings2 } from "lucide-react";
import {
  AdminAlert,
  AdminPage,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSection,
  AdminSkeleton,
  AdminToggleRow,
} from "@/components/admin/AdminUi";
import {
  DEFAULT_SITE_SETTINGS,
  SITE_SETTING_KEYS,
  type SiteSettingsConfig,
} from "@/lib/config/site-settings-config";

type SettingGroup = {
  title: string;
  description: string;
  keys: (keyof SiteSettingsConfig)[];
};

const SETTING_META: Record<
  keyof SiteSettingsConfig,
  { label: string; description: string }
> = {
  discordLoginEnabled: {
    label: "Login con Discord",
    description:
      "Muestra el botón «Continúa con Discord» en login. Solo funciona para cuentas que ya vincularon Discord en el dashboard.",
  },
  allowLoginCodeByEmail: {
    label: "Código por correo al login",
    description:
      "Permite que cada usuario active el código de acceso por email en su cuenta. Si está desactivado, solo email y contraseña.",
  },
  showPublicUidInAccount: {
    label: "Serial (UID) en cuenta",
    description:
      "Muestra el identificador EYE-000001 en Ajustes de cuenta del dashboard. No aparece en el perfil público.",
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
  supportEnabled: {
    label: "Centro de soporte",
    description:
      "Permite a los usuarios abrir tickets desde /support cuando tienen problemas con la web.",
  },
  hideAdminProfilesInDiscover: {
    label: "Ocultar admins en Descubre",
    description: "Excluye las cuentas con rol admin del podio y del listado en /discover.",
  },
};

const SETTING_GROUPS: SettingGroup[] = [
  {
    title: "Acceso e identidad",
    description: "Login, OAuth y datos visibles en la cuenta del usuario.",
    keys: ["discordLoginEnabled", "allowLoginCodeByEmail", "showPublicUidInAccount"],
  },
  {
    title: "Perfiles y contenido",
    description: "Funciones del editor y del perfil público.",
    keys: [
      "profileReviewsEnabled",
      "claimProfileCtaEnabled",
      "profileAudioEnabled",
      "profileAccessCodeEnabled",
    ],
  },
  {
    title: "Comunidad y descubrimiento",
    description: "Enlaces externos y visibilidad en Descubre.",
    keys: ["communityDiscordEnabled", "hideAdminProfilesInDiscover"],
  },
  {
    title: "Soporte",
    description: "Tickets y ayuda a usuarios.",
    keys: ["supportEnabled"],
  },
];

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
      <AdminPage>
        <AdminSkeleton className="h-64" />
      </AdminPage>
    );
  }

  const knownKeys = new Set<keyof SiteSettingsConfig>(SITE_SETTING_KEYS);
  const groupedKeys = new Set(SETTING_GROUPS.flatMap((g) => g.keys));

  return (
    <AdminPage>
      <AdminPageHeader
        title="Configuración"
        description="Controla qué funciones están activas para todos los usuarios. Los cambios se aplican al guardar."
        icon={<Settings2 className="h-5 w-5" />}
        actions={
          <AdminPrimaryButton onClick={() => void save()} loading={saving} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </AdminPrimaryButton>
        }
      />

      <div className="space-y-6">
        {SETTING_GROUPS.map((group) => (
          <AdminSection key={group.title} title={group.title} description={group.description}>
            {group.keys.map((key) => {
              const meta = SETTING_META[key];
              return (
                <AdminToggleRow
                  key={key}
                  label={meta.label}
                  description={meta.description}
                  checked={settings[key]}
                  onChange={() => toggle(key)}
                />
              );
            })}
          </AdminSection>
        ))}

        {SITE_SETTING_KEYS.filter((key) => !groupedKeys.has(key) && knownKeys.has(key)).length >
        0 ? (
          <AdminSection title="Otras opciones" description="Ajustes adicionales del sitio.">
            {SITE_SETTING_KEYS.filter((key) => !groupedKeys.has(key)).map((key) => {
              const meta = SETTING_META[key];
              return (
                <AdminToggleRow
                  key={key}
                  label={meta.label}
                  description={meta.description}
                  checked={settings[key]}
                  onChange={() => toggle(key)}
                />
              );
            })}
          </AdminSection>
        ) : null}
      </div>

      {error ? (
        <div className="mt-6">
          <AdminAlert tone="error">{error}</AdminAlert>
        </div>
      ) : null}
      {success ? (
        <div className="mt-6">
          <AdminAlert tone="success">{success}</AdminAlert>
        </div>
      ) : null}

      <div className="mt-8 lg:hidden">
        <AdminPrimaryButton onClick={() => void save()} loading={saving} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </AdminPrimaryButton>
      </div>
    </AdminPage>
  );
}
