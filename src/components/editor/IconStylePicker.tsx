"use client";

import type { ReactNode } from "react";
import { Globe } from "lucide-react";
import type { IconShape, ProfileNameIconShape } from "@/lib/config/icon-style-config";
import {
  ICON_COLOR_MODE_OPTIONS,
  ICON_SHAPE_OPTIONS,
  PROFILE_NAME_ICON_SHAPE_OPTIONS,
  getIconContainerStyle,
  getIconLinkWrapperClass,
  getIconShapeClass,
  getPlatformLinkColor,
  isPlainLinkIcons,
  resolveIconStyle,
  settingsForIconColorMode,
} from "@/lib/config/icon-style-config";
import type { ProfileSettings } from "@/types/profile";
import { useI18n } from "@/components/providers/LocaleProvider";
import { PlatformIcon } from "@/components/shared/PlatformIcons";
import { PLATFORM_CONFIG } from "@/lib/config/platforms";

interface Props {
  settings: ProfileSettings;
  onChange: (patch: Partial<ProfileSettings>) => void;
}

function ShapeButton({
  active,
  label,
  previewClass,
  onClick,
}: {
  active: boolean;
  label: string;
  previewClass?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2 text-[10px] font-medium transition-colors ${
        active
          ? "border-purple-500/60 bg-purple-500/20 text-white"
          : "border-white/10 bg-white/3 text-white/55 hover:border-white/20 hover:text-white/80"
      }`}
    >
      {previewClass ? (
        <span
          className={`h-5 w-5 border border-white/25 bg-white/10 ${previewClass}`}
          aria-hidden
        />
      ) : null}
      {label}
    </button>
  );
}

function IconPreview({ settings }: { settings: ProfileSettings }) {
  const iconStyle = resolveIconStyle(settings);
  const plain = isPlainLinkIcons(iconStyle.iconShape);
  const shapeClass = getIconShapeClass(iconStyle.iconShape);
  const containerStyle = getIconContainerStyle(iconStyle);
  const samples = [
    { key: "discord", color: getPlatformLinkColor(iconStyle, PLATFORM_CONFIG.discord.color) },
    { key: "github", color: getPlatformLinkColor(iconStyle, PLATFORM_CONFIG.github.color) },
    { key: "custom", color: iconStyle.customIconColor },
  ] as const;

  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-black/20 px-3 py-3">
      {samples.map(({ key, color }) => (
        <span
          key={key}
          className={
            plain
              ? "flex h-10 w-10 items-center justify-center"
              : `flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 ${shapeClass}`
          }
          style={{
            color,
            filter: iconStyle.glowIcons ? `drop-shadow(0 0 6px ${color})` : undefined,
            ...(plain ? {} : containerStyle),
          }}
        >
          {key === "custom" ? (
            <Globe className="h-4 w-4" />
          ) : (
            <PlatformIcon platform={key} />
          )}
        </span>
      ))}
    </div>
  );
}

export default function IconStylePicker({ settings, onChange }: Props) {
  const { t } = useI18n();
  const colorMode =
    settings.iconColorMode ?? (settings.monochromeIcons ? "unified" : "platform");
  const iconShape = settings.iconShape ?? "rounded";
  const profileNameIconShape = settings.profileNameIconShape ?? "rounded";
  const iconBackground = settings.iconBackgroundColor?.trim() ?? "";
  const profileNameRing = settings.profileNameIconRingColor?.trim() ?? "";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-white/45 mb-2">{t("dashboard.iconsSectionHint")}</p>
        <IconPreview settings={settings} />
      </div>

      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-sm text-white/70">{t("dashboard.glowIcons")}</span>
        <input
          type="checkbox"
          checked={settings.glowIcons}
          onChange={(e) => onChange({ glowIcons: e.target.checked })}
          className="h-4 w-4 rounded accent-purple-500"
        />
      </label>

      <Subsection title={t("dashboard.linkIconsSubsection")}>
        <Field label={t("dashboard.iconColorMode")}>
          <div className="grid grid-cols-2 gap-2">
            {ICON_COLOR_MODE_OPTIONS.map((opt) => (
              <ShapeButton
                key={opt.value}
                active={colorMode === opt.value}
                label={t(opt.labelKey)}
                onClick={() => onChange(settingsForIconColorMode(opt.value))}
              />
            ))}
          </div>
        </Field>

        {colorMode === "unified" && (
          <ColorRow
            label={t("dashboard.iconColor")}
            value={settings.iconColor?.trim() || settings.accentColor}
            onChange={(iconColor) => onChange({ iconColor })}
          />
        )}

        <ColorRow
          label={t("dashboard.customLinkIconColor")}
          value={
            settings.customLinkIconColor?.trim() ||
            settings.iconColor?.trim() ||
            settings.accentColor
          }
          onChange={(customLinkIconColor) => onChange({ customLinkIconColor })}
        />

        <OptionalColorRow
          label={t("dashboard.iconBackgroundColor")}
          value={iconBackground}
          fallback="#ffffff"
          placeholder={t("dashboard.iconBackgroundDefault")}
          resetLabel={t("common.reset")}
          onChange={(iconBackgroundColor) => onChange({ iconBackgroundColor })}
          onClear={() => onChange({ iconBackgroundColor: "" })}
        />

        <Field label={t("dashboard.iconShape")}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ICON_SHAPE_OPTIONS.map((opt) => (
              <ShapeButton
                key={opt.value}
                active={iconShape === opt.value}
                label={t(opt.labelKey)}
                previewClass={opt.value === "none" ? undefined : getIconShapeClass(opt.value)}
                onClick={() => onChange({ iconShape: opt.value as IconShape })}
              />
            ))}
          </div>
        </Field>
      </Subsection>

      <Subsection title={t("dashboard.profileIconsSubsection")}>
        <Field label={t("dashboard.profileNameIconShape")}>
          <div className="grid grid-cols-3 gap-2">
            {PROFILE_NAME_ICON_SHAPE_OPTIONS.map((opt) => (
              <ShapeButton
                key={opt.value}
                active={profileNameIconShape === opt.value}
                label={t(opt.labelKey)}
                previewClass={getIconShapeClass(opt.value)}
                onClick={() => onChange({ profileNameIconShape: opt.value as ProfileNameIconShape })}
              />
            ))}
          </div>
        </Field>

        <OptionalColorRow
          label={t("dashboard.profileNameIconRingColor")}
          value={profileNameRing}
          fallback={settings.accentColor}
          placeholder={t("dashboard.profileNameIconRingDefault")}
          resetLabel={t("common.reset")}
          onChange={(profileNameIconRingColor) => onChange({ profileNameIconRingColor })}
          onClear={() => onChange({ profileNameIconRingColor: "" })}
        />
      </Subsection>

      <p className="text-xs text-white/35 leading-relaxed border-t border-white/8 pt-3">
        {t("dashboard.customLinkIconsHint")}
      </p>
    </div>
  );
}

function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-lg border border-white/8 bg-white/[0.02] p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/50 mb-2">{label}</p>
      {children}
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-white/50 mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field flex-1 font-mono text-xs"
        />
      </div>
    </div>
  );
}

function OptionalColorRow({
  label,
  value,
  fallback,
  placeholder,
  resetLabel,
  onChange,
  onClear,
}: {
  label: string;
  value: string;
  fallback: string;
  placeholder: string;
  resetLabel: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  const hasValue = Boolean(value);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs text-white/50">{label}</p>
        {hasValue ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] text-white/35 hover:text-white/60 transition-colors"
          >
            {resetLabel}
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hasValue ? value : fallback}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent shrink-0"
        />
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="input-field flex-1 font-mono text-xs"
        />
      </div>
    </div>
  );
}
