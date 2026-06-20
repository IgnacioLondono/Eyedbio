"use client";

import { useMemo } from "react";
import type { CardLayout, LinkStyle, AvatarStyle } from "@/types/profile";
import {
  CARD_LAYOUT_OPTIONS,
  LINK_STYLE_OPTIONS,
  AVATAR_STYLE_OPTIONS,
  getLayoutThumbnailProfile,
  resolveCardLayout,
} from "@/lib/card-layout-config";
import ProfileCard from "@/components/ProfileCard";
import { useI18n } from "@/components/LocaleProvider";
import { getMessages } from "@/lib/i18n";

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
      className="relative w-full h-[108px] rounded-lg overflow-hidden bg-[#0a0a0f] border border-white/10"
      aria-hidden
    >
      <div className="absolute left-1/2 top-1/2 w-[280px] -translate-x-1/2 -translate-y-1/2 scale-[0.32] origin-center pointer-events-none select-none">
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
  const { locale } = useI18n();
  const msg = getMessages(locale);
  const activeLayout = resolveCardLayout({ cardLayout });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-white/40 mb-3">
          {msg.cardPicker.structure}
        </p>
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          role="radiogroup"
          aria-label={msg.cardPicker.structureAria}
        >
          {CARD_LAYOUT_OPTIONS.map((opt) => {
            const active = activeLayout === opt.value;
            const inputId = `card-layout-${opt.value}`;
            const layoutMsg = msg.cardLayouts[opt.value];
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
                <p className="text-xs font-medium text-white/90 mt-2">{layoutMsg?.label}</p>
                <p className="text-[10px] text-white/40 mt-0.5 leading-snug line-clamp-2">
                  {layoutMsg?.description}
                </p>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-white/40 mb-3">
          {msg.cardPicker.linkMode}
        </p>
        <div
          className="grid grid-cols-2 gap-2"
          role="radiogroup"
          aria-label={msg.cardPicker.linkModeAria}
        >
          {LINK_STYLE_OPTIONS.map((opt) => {
            const active = linkStyle === opt.value;
            const inputId = `link-style-${opt.value}`;
            const styleMsg = msg.linkStyles[opt.value];
            return (
              <label
                key={opt.value}
                htmlFor={inputId}
                className={`block rounded-xl border p-3 cursor-pointer transition-all ${
                  active
                    ? "border-purple-500 bg-purple-500/15"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="linkStyle"
                  value={opt.value}
                  checked={active}
                  onChange={() => onLinkStyleChange(opt.value)}
                  className="sr-only"
                />
                <p className="text-xs font-medium text-white/90">{styleMsg?.label}</p>
                <p className="text-[10px] text-white/40 mt-1">{styleMsg?.description}</p>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-white/40 mb-3">{msg.cardPicker.avatar}</p>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label={msg.cardPicker.avatarAria}
        >
          {AVATAR_STYLE_OPTIONS.map((opt) => {
            const active = avatarStyle === opt.value;
            const inputId = `avatar-style-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={inputId}
                className={`px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  active
                    ? "border-purple-500 bg-purple-500/15 text-purple-200"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="avatarStyle"
                  value={opt.value}
                  checked={active}
                  onChange={() => onAvatarStyleChange(opt.value)}
                  className="sr-only"
                />
                {msg.avatarStyles[opt.value]?.label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
