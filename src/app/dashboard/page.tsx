"use client";

import { Suspense, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ExternalLink,
  Plus,
  Trash2,
  Save,
  UserRound,
  Palette,
  Link2,
  Settings,
  Music,
  LogOut,
} from "lucide-react";
import {
  Profile,
  SocialLink,
  SocialPlatform,
  BackgroundEffect,
  BackgroundType,
  NameEffect,
} from "@/types/profile";
import { NAME_EFFECT_OPTIONS } from "@/lib/name-effects";
import { createEmptyLink } from "@/lib/profile-mapper";
import { resolveBackgroundType } from "@/lib/media-config";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import ProfileCard from "@/components/ProfileCard";
import BackgroundEffects from "@/components/BackgroundEffects";
import BackgroundMedia from "@/components/BackgroundMedia";
import FileUpload from "@/components/FileUpload";
import Logo from "@/components/Logo";
import AccountSettings from "@/components/AccountSettings";

type Tab = "general" | "links" | "media" | "appearance" | "account";

const VALID_TABS: Tab[] = ["general", "links", "media", "appearance", "account"];

function parseTab(value: string | null): Tab {
  if (value && VALID_TABS.includes(value as Tab)) return value as Tab;
  return "general";
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTabState] = useState<Tab>(() => parseTab(searchParams.get("tab")));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
      })
      .then(setProfile)
      .catch(() => setError("No se pudo cargar el perfil"));
  }, []);

  useEffect(() => {
    setTabState(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  const setTab = (nextTab: Tab) => {
    setTabState(nextTab);
    router.replace(`${pathname}?tab=${nextTab}`, { scroll: false });
  };

  const update = (partial: Partial<Profile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...partial });
    setSaved(false);
  };

  const updateSettings = (partial: Partial<Profile["settings"]>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      settings: { ...profile.settings, ...partial },
    });
    setSaved(false);
  };

  const updateBackground = (url: string, backgroundType?: BackgroundType) => {
    if (!profile) return;
    const nextType = backgroundType ?? resolveBackgroundType(url, profile.backgroundType);
    setProfile({
      ...profile,
      backgroundType: nextType,
      settings: { ...profile.settings, backgroundUrl: url },
    });
    setSaved(false);
  };

  const clearBackground = () => {
    if (!profile) return;
    setProfile({
      ...profile,
      backgroundType: "image",
      settings: { ...profile.settings, backgroundUrl: "" },
    });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");

      setProfile(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    if (!profile) return;
    update({ links: [...profile.links, createEmptyLink()] });
  };

  const updateLink = (id: string, partial: Partial<SocialLink>) => {
    if (!profile) return;
    update({
      links: profile.links.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    });
  };

  const removeLink = (id: string) => {
    if (!profile) return;
    update({ links: profile.links.filter((l) => l.id !== id) });
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-3">
        {error ? (
          <>
            <p className="text-white/50 text-sm">{error}</p>
            <Link href="/login" className="text-purple-400 text-sm hover:underline">
              Ir a iniciar sesión
            </Link>
          </>
        ) : (
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Settings }[] = [
    { id: "general", label: "Perfil", icon: UserRound },
    { id: "links", label: "Enlaces", icon: Link2 },
    { id: "media", label: "Media", icon: Music },
    { id: "appearance", label: "Estilo", icon: Palette },
    { id: "account", label: "Cuenta", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo href="/" size="sm" />

          <div className="flex items-center gap-2">
            <Link
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
            >
              <UserRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver perfil</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saved ? "Guardado ✓" : saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
            {error}
          </p>
        </div>
      )}

      <div
        className={`max-w-7xl mx-auto px-6 py-8 grid gap-8 items-start ${
          tab === "account" ? "lg:grid-cols-1" : "lg:grid-cols-2"
        }`}
      >
        <div className="relative z-20 min-w-0 w-full max-w-2xl">
          <div className="grid grid-cols-5 gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl mb-6 w-full max-w-xl">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-1 py-2.5 px-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                  tab === t.id
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <t.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {tab === "general" && (
              <>
                <Field label="Nombre para mostrar">
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => update({ displayName: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Bio">
                  <textarea
                    value={profile.bio}
                    onChange={(e) => update({ bio: e.target.value })}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Cuéntanos sobre ti..."
                  />
                </Field>
                <FileUpload
                  kind="avatar"
                  label="Foto de perfil"
                  hint="JPG, PNG, WebP o GIF · máx. 5MB"
                  currentUrl={profile.avatarUrl}
                  onUploaded={(url) => update({ avatarUrl: url })}
                  onClear={() =>
                    update({
                      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
                    })
                  }
                />
              </>
            )}

            {tab === "links" && (
              <>
                {profile.links.length === 0 && (
                  <p className="text-white/40 text-sm text-center py-2">
                    Pulsa el botón de abajo para añadir tu primer enlace.
                  </p>
                )}
                {profile.links.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={link.platform}
                        onChange={(e) =>
                          updateLink(link.id, {
                            platform: e.target.value as SocialPlatform,
                          })
                        }
                        className="input-field flex-1"
                      >
                        {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key}>
                            {cfg.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeLink(link.id)}
                        className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(link.id, { url: e.target.value })}
                      placeholder="https://..."
                      className="input-field"
                    />
                  </div>
                ))}
                <button
                  onClick={addLink}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 rounded-xl text-white/40 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Añadir enlace
                </button>
              </>
            )}

            {tab === "media" && (
              <>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white">Fondo del perfil</h3>
                    <p className="text-xs text-white/40 mt-1 mb-3">
                      Sube tu propia imagen, GIF animado o video de fondo. Se verá detrás de tu
                      tarjeta en el perfil público.
                    </p>
                    <FileUpload
                      kind="background"
                      label=""
                      hint="Máximo 50 MB · Recuerda pulsar Guardar después de subir"
                      currentUrl={profile.settings.backgroundUrl}
                      mediaType={profile.backgroundType}
                      onUploaded={(url, backgroundType) => updateBackground(url, backgroundType)}
                      onClear={clearBackground}
                    />
                  </div>
                  <Field label="O pega una URL externa">
                    <input
                      type="url"
                      value={profile.settings.backgroundUrl}
                      onChange={(e) => updateBackground(e.target.value)}
                      className="input-field"
                      placeholder="https://ejemplo.com/mi-fondo.mp4"
                    />
                  </Field>
                </div>
                <FileUpload
                  kind="audio"
                  label="Audio de fondo"
                  hint="MP3, WAV, OGG, M4A, AAC, FLAC, OPUS, AIFF, MIDI · máx. 25MB"
                  currentUrl={profile.audioUrl}
                  onUploaded={(url) => update({ audioUrl: url, audioEnabled: true })}
                  onClear={() => update({ audioUrl: undefined, audioEnabled: false })}
                />
                <Toggle
                  label="Reproducir audio en el perfil"
                  checked={profile.audioEnabled}
                  onChange={(v) => update({ audioEnabled: v })}
                />
              </>
            )}

            {tab === "appearance" && (
              <>
                <Field label="Efecto de fondo">
                  <select
                    value={profile.settings.backgroundEffect}
                    onChange={(e) =>
                      updateSettings({
                        backgroundEffect: e.target.value as BackgroundEffect,
                      })
                    }
                    className="input-field"
                  >
                    <option value="none">Ninguno</option>
                    <option value="stars">Estrellas</option>
                    <option value="snow">Nieve</option>
                    <option value="rain">Lluvia</option>
                  </select>
                </Field>

                <Field label={`Opacidad (${Math.round(profile.settings.profileOpacity * 100)}%)`}>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.01"
                    value={profile.settings.profileOpacity}
                    onChange={(e) =>
                      updateSettings({ profileOpacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-purple-500"
                  />
                </Field>

                <Field label={`Blur (${profile.settings.profileBlur}px)`}>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={profile.settings.profileBlur}
                    onChange={(e) =>
                      updateSettings({ profileBlur: parseInt(e.target.value) })
                    }
                    className="w-full accent-purple-500"
                  />
                </Field>

                <p className="text-xs uppercase tracking-wider text-white/40 pt-2">
                  Colores de la tarjeta
                </p>

                <ColorField
                  label="Color principal"
                  value={profile.settings.cardColor}
                  onChange={(v) => updateSettings({ cardColor: v })}
                />

                {profile.settings.gradientEnabled && (
                  <ColorField
                    label="Color secundario (gradiente)"
                    value={profile.settings.cardColorSecondary}
                    onChange={(v) => updateSettings({ cardColorSecondary: v })}
                  />
                )}

                <ColorField
                  label="Color del texto"
                  value={profile.settings.textColor}
                  onChange={(v) => updateSettings({ textColor: v })}
                />

                <ColorField
                  label="Color de acento (brillo y borde)"
                  value={profile.settings.accentColor}
                  onChange={(v) => updateSettings({ accentColor: v })}
                />

                <Field label="Efecto en el nombre">
                  <select
                    value={profile.settings.nameEffect}
                    onChange={(e) =>
                      updateSettings({ nameEffect: e.target.value as NameEffect })
                    }
                    className="input-field"
                  >
                    {NAME_EFFECT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Toggle
                  label="Brillo en iconos"
                  checked={profile.settings.glowIcons}
                  onChange={(v) => updateSettings({ glowIcons: v })}
                />
                <Toggle
                  label="Gradiente en tarjeta"
                  checked={profile.settings.gradientEnabled}
                  onChange={(v) => updateSettings({ gradientEnabled: v })}
                />
                <Toggle
                  label="Iconos monocromáticos"
                  checked={profile.settings.monochromeIcons}
                  onChange={(v) => updateSettings({ monochromeIcons: v })}
                />
              </>
            )}

            {tab === "account" && (
              <AccountSettings
                profileUsername={profile.username}
                onUsernameUpdated={(username) => update({ username })}
              />
            )}
          </div>
        </div>

        <div
          className={`lg:sticky lg:top-20 lg:self-start relative z-10 min-w-0 w-full max-w-[340px] mx-auto lg:max-w-none ${
            tab === "account" ? "hidden" : ""
          }`}
        >
          <p className="text-white/40 text-xs uppercase tracking-wider mb-4 text-center">
            Vista previa
          </p>
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 aspect-[9/16] max-h-[min(700px,85vh)] isolate bg-[#0a0a0f]">
            <BackgroundMedia
              url={profile.settings.backgroundUrl}
              type={profile.backgroundType}
              contained
            />
            <div className="absolute inset-0 bg-black/50 pointer-events-none z-[2]" />
            <BackgroundEffects effect={profile.settings.backgroundEffect} contained />
            <div className="absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-none">
              <div className="pointer-events-auto w-full flex justify-center">
                <ProfileCard profile={profile} compact />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-2">{label}</label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field flex-1 font-mono text-sm"
        />
      </div>
    </Field>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
      <span className="text-sm text-white/70">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-purple-600" : "bg-white/10"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
