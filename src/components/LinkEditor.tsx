"use client";

import { useRef, useState } from "react";
import { Globe, Loader2, Trash2 } from "lucide-react";
import { SocialLink, SocialPlatform } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import { PLATFORM_CATEGORIES, getPlatformUrlPlaceholder } from "@/lib/platform-categories";
import { PlatformIcon } from "@/components/PlatformIcons";
import { createEmptyLink } from "@/lib/profile-mapper";
import { ACCEPT_ATTR } from "@/lib/media-config";
import { getMediaSrc } from "@/lib/media-url";

interface Props {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

function LinkIconPreview({
  link,
  onUploaded,
}: {
  link: SocialLink;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "linkIcon");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir");

      onUploaded(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 transition-colors overflow-hidden disabled:opacity-50"
        aria-label="Subir icono personalizado"
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 animate-spin text-white/50" />
        ) : link.iconUrl ? (
          <img
            src={getMediaSrc(link.iconUrl)}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <Globe className="w-6 h-6 text-white/50" />
        )}
      </button>
      <span className="text-[10px] text-white/35">
        {link.iconUrl ? "Cambiar icono" : "Subir icono"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR.linkIcon}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p className="text-[10px] text-red-400 text-center">{error}</p>}
    </div>
  );
}

export default function LinkEditor({ links, onChange }: Props) {
  const usedPlatforms = new Set(
    links.filter((l) => l.platform !== "custom").map((l) => l.platform)
  );

  const addLink = (platform: SocialPlatform) => {
    onChange([...links, createEmptyLink(platform)]);
  };

  const addCustomLink = () => {
    onChange([...links, createEmptyLink("custom")]);
  };

  const updateLink = (id: string, partial: Partial<SocialLink>) => {
    onChange(links.map((l) => (l.id === id ? { ...l, ...partial } : l)));
  };

  const removeLink = (id: string) => {
    onChange(links.filter((l) => l.id !== id));
  };

  const hasAvailablePlatforms = PLATFORM_CATEGORIES.some((category) =>
    category.platforms.some((platform) => !usedPlatforms.has(platform))
  );

  return (
    <div className="space-y-6">
      {links.length === 0 ? (
        <p className="text-white/40 text-sm text-center py-2">
          Elige un icono abajo para añadir tu primer enlace.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {links.map((link) => {
            const config = PLATFORM_CONFIG[link.platform];
            const isCustom = link.platform === "custom";

            return (
              <div
                key={link.id}
                className="flex flex-col items-center p-4 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="w-full flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {isCustom ? link.label || config.label : config.label}
                    </p>
                    <input
                      type="text"
                      value={link.label ?? ""}
                      onChange={(e) => updateLink(link.id, { label: e.target.value || undefined })}
                      placeholder="Nombre visible (opcional)"
                      className="input-field text-xs py-1.5 mt-1.5"
                      aria-label={`Nombre visible para ${config.label}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(link.id)}
                    className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
                    aria-label={`Quitar ${config.label}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isCustom ? (
                  <LinkIconPreview
                    link={link}
                    onUploaded={(iconUrl) => updateLink(link.id, { iconUrl })}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/5 border border-white/10 mb-3"
                    style={{ color: config.color }}
                  >
                    <PlatformIcon platform={link.platform} />
                  </div>
                )}

                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                  placeholder={getPlatformUrlPlaceholder(link.platform)}
                  className="input-field w-full text-sm mt-3"
                  aria-label={`Enlace de ${config.label}`}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-5">
        {hasAvailablePlatforms && (
          <div className="space-y-5">
            {PLATFORM_CATEGORIES.map((category) => {
              const available = category.platforms.filter(
                (platform) => !usedPlatforms.has(platform)
              );
              if (available.length === 0) return null;

              return (
                <div key={category.id} className="space-y-3">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    {category.label}
                  </p>
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                    {available.map((platform) => {
                      const config = PLATFORM_CONFIG[platform];
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => addLink(platform)}
                          title={config.label}
                          className="group flex flex-col items-center gap-1.5 p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-purple-500/10 hover:border-purple-500/30 transition-all"
                        >
                          <span className="text-[9px] text-white/30 group-hover:text-white/50 truncate w-full text-center leading-tight">
                            {config.label.split(" ")[0]}
                          </span>
                          <span
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 group-hover:scale-105 transition-transform"
                            style={{ color: config.color }}
                          >
                            <PlatformIcon platform={platform} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={addCustomLink}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] hover:bg-purple-500/10 hover:border-purple-500/30 transition-all text-left"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 shrink-0">
            <Globe className="w-5 h-5 text-white/60" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-white">Añadir URL personalizada</span>
            <span className="block text-xs text-white/40 mt-0.5">
              Usa tu propia URL y elige un icono que encaje.
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
