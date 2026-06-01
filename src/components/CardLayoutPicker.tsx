"use client";

import { useMemo } from "react";
import type { CardLayout, LinkStyle, AvatarStyle } from "@/types/profile";
import {
  AVATAR_STYLE_OPTIONS,
  CARD_LAYOUT_OPTIONS,
  LINK_STYLE_OPTIONS,
  getLayoutThumbnailProfile,
  resolveCardLayout,
} from "@/lib/card-layout-config";
import ProfileCard from "@/components/ProfileCard";

interface Props {
  cardLayout: CardLayout;
  linkStyle: LinkStyle;
  avatarStyle: AvatarStyle;
  onSelectLayout: (layout: CardLayout) => void;
  onLinkStyleChange: (style: LinkStyle) => void;
  onAvatarStyleChange: (style: AvatarStyle) => void;
}

function LayoutThumbnail({ layout }: { layout: CardLayout }) {
  const profile = useMemo(() => getLayoutThumbnailProfile(layout), [layout]);

  return (
    <div
      className="relative w-full h-[100px] rounded-lg overflow-hidden bg-[#0a0a0f] border border-white/10"
      aria-hidden
    >
      <div className="absolute left-1/2 top-1.5 w-[240px] -translate-x-1/2 scale-[0.34] origin-top pointer-events-none select-none">
        <ProfileCard profile={profile} compact />
      </div>
    </div>
  );
}

export default function CardLayoutPicker({
  cardLayout,
  linkStyle,
  avatarStyle,
  onSelectLayout,
  onLinkStyleChange,
  onAvatarStyleChange,
}: Props) {
  const activeLayout = resolveCardLayout({ cardLayout });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Estructura</p>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          role="radiogroup"
          aria-label="Estructura de tarjeta"
        >
          {CARD_LAYOUT_OPTIONS.map((opt) => {
            const active = activeLayout === opt.value;
            const inputId = `card-layout-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={inputId}
                className={`block rounded-xl border p-2 cursor-pointer transition-all ${
                  active
                    ? "border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/50 ring-offset-2 ring-offset-[#0a0a0f]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="cardLayout"
                  value={opt.value}
                  checked={active}
                  onChange={() => onSelectLayout(opt.value)}
                  className="sr-only"
                />
                <LayoutThumbnail layout={opt.value} />
                <p className="text-xs font-medium text-white/90 mt-2">{opt.label}</p>
                <p className="text-[10px] text-white/40 line-clamp-2 leading-tight mt-0.5">
                  {opt.description}
                </p>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Enlaces</p>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Estilo de enlaces">
          {LINK_STYLE_OPTIONS.map((opt) => {
            const disabled = activeLayout === "minimal" && opt.value !== "row";
            const active = linkStyle === opt.value;
            const inputId = `link-style-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={inputId}
                className={`block rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  active
                    ? "border-purple-500 bg-purple-500/15 ring-1 ring-purple-500/40 text-white"
                    : "border-white/10 text-white/70 hover:border-white/20"
                } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="linkStyle"
                  value={opt.value}
                  checked={active}
                  disabled={disabled}
                  onChange={() => onLinkStyleChange(opt.value)}
                  className="sr-only"
                />
                <span className="font-medium block">{opt.label}</span>
                <span className="text-[10px] text-white/40">{opt.description}</span>
              </label>
            );
          })}
        </div>
        {activeLayout === "minimal" && (
          <p className="text-[11px] text-white/30 mt-1.5">Minimal usa fila de iconos.</p>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Avatar</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Estilo de avatar">
          {AVATAR_STYLE_OPTIONS.map((opt) => {
            const inputId = `avatar-style-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={inputId}
                className={`rounded-lg border px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                  avatarStyle === opt.value
                    ? "border-purple-500 bg-purple-500/15 ring-1 ring-purple-500/40 text-white"
                    : "border-white/10 text-white/70 hover:border-white/20"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="avatarStyle"
                  value={opt.value}
                  checked={avatarStyle === opt.value}
                  onChange={() => onAvatarStyleChange(opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
