"use client";

import { Suspense, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ExternalLink,
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
  BackgroundType,
  NameEffect,
} from "@/types/profile";
import { NAME_EFFECT_OPTIONS } from "@/lib/name-effects";
import { resolveBackgroundType } from "@/lib/media-config";
import ProfileCard from "@/components/ProfileCard";
import BackgroundEffects from "@/components/BackgroundEffects";
import BackgroundEffectSelect from "@/components/BackgroundEffectSelect";
import BackgroundMedia from "@/components/BackgroundMedia";
import FileUpload from "@/components/FileUpload";
import AudioClipSelector from "@/components/AudioClipSelector";
import Logo from "@/components/Logo";
import AccountSettings from "@/components/AccountSettings";
import LinkEditor from "@/components/LinkEditor";
import ShareProfileButton from "@/components/ShareProfileButton";
import CommunityDiscordLink from "@/components/CommunityDiscordLink";
import CardLayoutPicker from "@/components/CardLayoutPicker";
import {
  resolveLinkStyle,
  resolveCardLayout,
  suggestedSettingsForLayout,
} from "@/lib/card-layout-config";

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
  const [isDirty, setIsDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        if (res.status === 401) throw new Error("SESSION_EXPIRED");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            typeof data.error === "string" ? data.error : "Error del servidor al cargar el perfil"
          );
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setIsDirty(false);
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "SESSION_EXPIRED") {
          setError("Tu sesión expiró. Vuelve a iniciar sesión.");
          return;
        }
        setError(err instanceof Error ? err.message : "No se pudo cargar el perfil");
      });
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
    setIsDirty(true);
  };

  const updateSettings = (
    partial:
      | Partial<Profile["settings"]>
      | ((current: Profile["settings"]) => Partial<Profile["settings"]>)
  ) => {
    setProfile((current) => {
      if (!current) return current;
      const patch = typeof partial === "function" ? partial(current.settings) : partial;
      return {
        ...current,
        settings: { ...current.settings, ...patch },
      };
    });
    setIsDirty(true);
  };

  const updateBackground = (url: string, backgroundType?: BackgroundType) => {
    if (!profile) return;
    const nextType = backgroundType ?? resolveBackgroundType(url, profile.backgroundType);
    setProfile({
      ...profile,
      backgroundType: nextType,
      settings: { ...profile.settings, backgroundUrl: url },
    });
    setIsDirty(true);
  };

  const clearBackground = () => {
    if (!profile) return;
    setProfile({
      ...profile,
      backgroundType: "image",
      settings: { ...profile.settings, backgroundUrl: "" },
    });
    setIsDirty(true);
  };

  const handleSave = async (): Promise<boolean> => {
    if (!profile) return false;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (res.status === 409) {
        throw new Error(
          data.error ??
            "El perfil cambió en otra pestaña. Recarga la página antes de guardar."
        );
      }
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");

      setProfile(data);
      setIsDirty(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openProfilePreview = () => {
    if (!profile) return;
    window.open(`/${profile.username}`, "_blank", "noopener,noreferrer");
  };

  const handleViewProfileClick = (event: React.MouseEvent) => {
    if (!isDirty) return;
    event.preventDefault();
    setShowUnsavedModal(true);
  };

  const handleSaveAndViewProfile = async () => {
    const ok = await handleSave();
    if (ok) {
      setShowUnsavedModal(false);
      openProfilePreview();
    }
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
            <CommunityDiscordLink variant="header" />
            <Link
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleViewProfileClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                isDirty
                  ? "text-amber-200/90 border-amber-400/30 hover:bg-amber-500/10"
                  : "text-white/60 hover:text-white border-white/10 hover:bg-white/5"
              }`}
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
              {justSaved ? "Guardado ✓" : saving ? "Guardando..." : "Guardar"}
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

      {showUnsavedModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsaved-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowUnsavedModal(false)}
            aria-label="Cerrar"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-2xl">
            <h2 id="unsaved-title" className="text-lg font-semibold text-white">
              Tienes cambios sin guardar
            </h2>
            <p className="mt-2 text-sm text-white/50 leading-relaxed">
              Guarda tu perfil antes de verlo público para que los visitantes vean la versión
              actualizada.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                className="px-4 py-2.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Seguir editando
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedModal(false);
                  openProfilePreview();
                }}
                className="px-4 py-2.5 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                Ver sin guardar
              </button>
              <button
                type="button"
                onClick={handleSaveAndViewProfile}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg transition-colors"
              >
                {saving ? "Guardando..." : "Guardar y ver"}
              </button>
            </div>
          </div>
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
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">Compartir perfil</h3>
                    <p className="text-xs text-white/40 mt-1">
                      Comparte en WhatsApp, X, Telegram o descarga una imagen para
                      historias de Instagram, TikTok y WhatsApp Status.
                    </p>
                  </div>
                  <p className="text-xs font-mono text-purple-300/80 break-all">
                    eyed.bio/{profile.username}
                  </p>
                  <ShareProfileButton
                    username={profile.username}
                    displayName={profile.displayName}
                    variant="inline"
                  />
                </div>
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
              <LinkEditor
                links={profile.links}
                onChange={(links) => update({ links })}
              />
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
                  hint="MP3, WAV, OGG, M4A, AAC, FLAC, OPUS, AIFF, MIDI · máx. 25MB · 30 s en el perfil"
                  currentUrl={profile.audioUrl}
                  onUploaded={(url) =>
                    update({ audioUrl: url, audioEnabled: true, audioStartTime: 0 })
                  }
                  onClear={() =>
                    update({ audioUrl: undefined, audioEnabled: false, audioStartTime: 0 })
                  }
                />
                {profile.audioUrl && (
                  <AudioClipSelector
                    audioUrl={profile.audioUrl}
                    startTime={profile.audioStartTime}
                    onChange={(audioStartTime) => update({ audioStartTime })}
                  />
                )}
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
                  <BackgroundEffectSelect
                    value={profile.settings.backgroundEffect}
                    onChange={(backgroundEffect) => updateSettings({ backgroundEffect })}
                  />
                </Field>

                <Field label={`Opacidad del fondo (${Math.round(profile.settings.profileOpacity * 100)}%)`}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={profile.settings.profileOpacity}
                    onChange={(e) =>
                      updateSettings({ profileOpacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-purple-500"
                    disabled={profile.settings.transparentCard}
                  />
                  {profile.settings.transparentCard && (
                    <p className="text-[11px] text-white/30 mt-1.5">
                      Desactivado en modo transparente.
                    </p>
                  )}
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
                  Estructura y enlaces
                </p>

                <CardLayoutPicker
                  cardLayout={resolveCardLayout(profile.settings)}
                  linkStyle={resolveLinkStyle(profile.settings)}
                  avatarStyle={profile.settings.avatarStyle}
                  onSelectLayout={(layout) =>
                    updateSettings((s) => {
                      const suggestions = suggestedSettingsForLayout(layout);
                      return {
                        cardLayout: layout,
                        ...suggestions,
                        linkStyle: resolveLinkStyle({
                          ...s,
                          cardLayout: layout,
                          ...suggestions,
                        }),
                      };
                    })
                  }
                  onLinkStyleChange={(linkStyle) => updateSettings({ linkStyle })}
                  onAvatarStyleChange={(avatarStyle) => updateSettings({ avatarStyle })}
                />

                <p className="text-xs uppercase tracking-wider text-white/40 pt-2">
                  Tarjeta
                </p>

                <Toggle
                  label="Tarjeta transparente (sin color de fondo)"
                  checked={profile.settings.transparentCard}
                  onChange={(v) => updateSettings({ transparentCard: v })}
                />
                <Toggle
                  label="Mostrar borde"
                  checked={profile.settings.showCardBorder}
                  onChange={(v) => updateSettings({ showCardBorder: v })}
                />
                <Toggle
                  label="Mostrar sombra"
                  checked={profile.settings.showCardShadow}
                  onChange={(v) => updateSettings({ showCardShadow: v })}
                />

                {profile.settings.showCardBorder && (
                  <Field
                    label={`Opacidad del borde (${Math.round(profile.settings.borderOpacity * 100)}%)`}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={profile.settings.borderOpacity}
                      onChange={(e) =>
                        updateSettings({ borderOpacity: parseFloat(e.target.value) })
                      }
                      className="w-full accent-purple-500"
                    />
                  </Field>
                )}

                <p className="text-xs uppercase tracking-wider text-white/40 pt-2">
                  Colores de la tarjeta
                </p>

                <ColorField
                  label="Color principal"
                  value={profile.settings.cardColor}
                  onChange={(v) => updateSettings({ cardColor: v })}
                  disabled={profile.settings.transparentCard}
                />

                {profile.settings.gradientEnabled && (
                  <ColorField
                    label="Color secundario (gradiente)"
                    value={profile.settings.cardColorSecondary}
                    onChange={(v) => updateSettings({ cardColorSecondary: v })}
                    disabled={profile.settings.transparentCard}
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
                  disabled={profile.settings.transparentCard}
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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Field label={label}>
      <div className={`flex items-center gap-3 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
          disabled={disabled}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field flex-1 font-mono text-sm"
          disabled={disabled}
        />
      </div>
    </Field>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <span className="text-sm text-white/70">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
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
