"use client";

import { Trash2 } from "lucide-react";
import { SocialLink, SocialPlatform } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import { PlatformIcon } from "@/components/PlatformIcons";
import { createEmptyLink } from "@/lib/profile-mapper";

interface Props {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

export default function LinkEditor({ links, onChange }: Props) {
  const usedPlatforms = new Set(links.map((l) => l.platform));
  const availablePlatforms = (Object.keys(PLATFORM_CONFIG) as SocialPlatform[]).filter(
    (p) => !usedPlatforms.has(p)
  );

  const addLink = (platform: SocialPlatform) => {
    onChange([...links, { ...createEmptyLink(), platform }]);
  };

  const updateLink = (id: string, partial: Partial<SocialLink>) => {
    onChange(links.map((l) => (l.id === id ? { ...l, ...partial } : l)));
  };

  const removeLink = (id: string) => {
    onChange(links.filter((l) => l.id !== id));
  };

  const urlPlaceholder = (platform: SocialPlatform) =>
    platform === "email" ? "mailto:tu@email.com" : "https://...";

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
            return (
              <div
                key={link.id}
                className="flex flex-col items-center p-4 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="w-full flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{config.label}</p>
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

                <div
                  className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/5 border border-white/10 mb-3"
                  style={{ color: config.color }}
                >
                  <PlatformIcon platform={link.platform} />
                </div>

                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                  placeholder={urlPlaceholder(link.platform)}
                  className="input-field w-full text-sm"
                  aria-label={`Enlace de ${config.label}`}
                />
              </div>
            );
          })}
        </div>
      )}

      {availablePlatforms.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-white/40">
            {links.length === 0 ? "Elige una plataforma" : "Añadir plataforma"}
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {availablePlatforms.map((platform) => {
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
      )}
    </div>
  );
}
