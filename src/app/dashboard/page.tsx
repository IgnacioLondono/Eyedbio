"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
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
} from "@/types/profile";
import { createEmptyLink } from "@/lib/profile-mapper";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import ProfileCard from "@/components/ProfileCard";
import BackgroundEffects from "@/components/BackgroundEffects";
import BackgroundMedia from "@/components/BackgroundMedia";
import FileUpload from "@/components/FileUpload";
import Logo from "@/components/Logo";

type Tab = "general" | "links" | "media" | "appearance";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>("general");
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
    { id: "general", label: "General", icon: Settings },
    { id: "links", label: "Enlaces", icon: Link2 },
    { id: "media", label: "Media", icon: Music },
    { id: "appearance", label: "Estilo", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo href="/dashboard" size="sm" title="Inicio del editor" />

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

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl mb-6 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <t.icon className="w-4 h-4 shrink-0" />
                {t.label}
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
                <FileUpload
                  kind="background"
                  label="Fondo (imagen, GIF o video)"
                  hint="Imágenes, GIFs, MP4, WebM o MOV · máx. 50MB"
                  currentUrl={profile.settings.backgroundUrl}
                  onUploaded={(url, backgroundType) => {
                    updateSettings({ backgroundUrl: url });
                    if (backgroundType) update({ backgroundType });
                  }}
                />
                <Field label="URL del fondo (alternativa)">
                  <input
                    type="url"
                    value={profile.settings.backgroundUrl}
                    onChange={(e) => {
                      updateSettings({ backgroundUrl: e.target.value });
                      update({ backgroundType: "image" });
                    }}
                    className="input-field"
                    placeholder="https://..."
                  />
                </Field>
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

                <Field label="Color de acento">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={profile.settings.accentColor}
                      onChange={(e) => updateSettings({ accentColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={profile.settings.accentColor}
                      onChange={(e) => updateSettings({ accentColor: e.target.value })}
                      className="input-field flex-1 font-mono text-sm"
                    />
                  </div>
                </Field>

                <Toggle
                  label="Brillo en nombre"
                  checked={profile.settings.glowUsername}
                  onChange={(v) => updateSettings({ glowUsername: v })}
                />
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
          </div>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-4 text-center">
            Vista previa
          </p>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[9/16] max-h-[700px]">
            <div className="absolute inset-0">
              <BackgroundMedia
                url={profile.settings.backgroundUrl}
                type={profile.backgroundType}
              />
            </div>
            <div className="absolute inset-0 bg-black/50" />
            <BackgroundEffects effect={profile.settings.backgroundEffect} />
            <div className="relative z-10 h-full flex items-center justify-center p-6 overflow-y-auto">
              <ProfileCard profile={profile} />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: rgba(168, 85, 247, 0.5);
        }
        .input-field option {
          background: #1a1a2e;
        }
      `}</style>
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
        className={`w-10 h-6 rounded-full transition-colors relative ${
          checked ? "bg-purple-600" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
