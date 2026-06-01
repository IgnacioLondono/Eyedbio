"use client";

import type { CardLayout, LinkStyle, AvatarStyle } from "@/types/profile";
import {
  AVATAR_STYLE_OPTIONS,
  CARD_LAYOUT_OPTIONS,
  LINK_STYLE_OPTIONS,
  suggestedSettingsForLayout,
} from "@/lib/card-layout-config";

interface Props {
  cardLayout: CardLayout;
  linkStyle: LinkStyle;
  avatarStyle: AvatarStyle;
  onLayoutChange: (layout: CardLayout) => void;
  onLinkStyleChange: (style: LinkStyle) => void;
  onAvatarStyleChange: (style: AvatarStyle) => void;
  onApplySuggestions?: (partial: ReturnType<typeof suggestedSettingsForLayout>) => void;
}

function MiniPreview({ layout }: { layout: CardLayout }) {
  const bar = "rounded bg-white/25";
  const dot = "rounded-full bg-white/40";
  return (
    <div className="aspect-[3/4] w-full rounded-lg border border-white/10 bg-[#12121a] p-2 flex flex-col gap-1 overflow-hidden">
      {layout === "banner" && <div className={`${bar} h-3 w-full shrink-0`} />}
      {layout === "split" ? (
        <div className="flex gap-1 flex-1 min-h-0">
          <div className={`${dot} w-5 h-5 shrink-0`} />
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className={`${bar} h-1.5 w-full`} />
            <div className={`${bar} h-1 w-2/3 opacity-60`} />
          </div>
        </div>
      ) : (
        <>
          <div
            className={`${dot} mx-auto shrink-0 ${
              layout === "hero" ? "w-6 h-6" : layout === "minimal" ? "w-4 h-4" : "w-5 h-5"
            }`}
          />
          <div className={`${bar} h-1 w-3/4 mx-auto`} />
          <div className={`${bar} h-0.5 w-1/2 mx-auto opacity-50`} />
        </>
      )}
      <div className="flex-1" />
      {(layout === "stack" || layout === "classic") && (
        <div className="flex flex-col gap-0.5">
          <div className={`${bar} h-1 w-full`} />
          <div className={`${bar} h-1 w-full opacity-70`} />
        </div>
      )}
      {(layout === "glass" || layout === "hero" || layout === "minimal") && (
        <div className="flex justify-center gap-0.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${dot} w-1.5 h-1.5`} />
          ))}
        </div>
      )}
      {layout === "split" && (
        <div className="flex flex-wrap gap-0.5 justify-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${dot} w-1.5 h-1.5`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CardLayoutPicker({
  cardLayout,
  linkStyle,
  avatarStyle,
  onLayoutChange,
  onLinkStyleChange,
  onAvatarStyleChange,
  onApplySuggestions,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Estructura</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CARD_LAYOUT_OPTIONS.map((opt) => {
            const active = cardLayout === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onLayoutChange(opt.value);
                  onApplySuggestions?.(suggestedSettingsForLayout(opt.value));
                }}
                className={`rounded-xl border p-2 text-left transition-colors ${
                  active
                    ? "border-purple-500/60 bg-purple-500/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <MiniPreview layout={opt.value} />
                <p className="text-xs font-medium text-white/90 mt-2">{opt.label}</p>
                <p className="text-[10px] text-white/40 line-clamp-2 leading-tight mt-0.5">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Enlaces</p>
        <div className="grid grid-cols-2 gap-2">
          {LINK_STYLE_OPTIONS.map((opt) => {
            const disabled = cardLayout === "minimal" && opt.value !== "row";
            const active = linkStyle === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={() => onLinkStyleChange(opt.value)}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  active
                    ? "border-purple-500/60 bg-purple-500/10 text-white"
                    : "border-white/10 text-white/70 hover:border-white/20"
                } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <span className="font-medium block">{opt.label}</span>
                <span className="text-[10px] text-white/40">{opt.description}</span>
              </button>
            );
          })}
        </div>
        {cardLayout === "minimal" && (
          <p className="text-[11px] text-white/30 mt-1.5">Minimal usa fila de iconos.</p>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Avatar</p>
        <div className="flex flex-wrap gap-2">
          {AVATAR_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAvatarStyleChange(opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                avatarStyle === opt.value
                  ? "border-purple-500/60 bg-purple-500/10 text-white"
                  : "border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
