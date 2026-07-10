"use client";

import type { LucideIcon } from "lucide-react";
import ColorInput from "@/components/shared/ColorInput";

export function DashboardSection({
  title,
  hint,
  icon: Icon,
  accent,
  children,
  className = "",
}: {
  title?: string;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border overflow-hidden transition-colors ${
        accent
          ? "border-purple-500/20 bg-[#12121a]"
          : "border-white/[0.06] bg-[#12121a]"
      } ${className}`}
    >
      {title ? (
        <header className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-white/[0.04]">
          {Icon ? (
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                accent ? "bg-purple-500/20" : "bg-white/[0.06]"
              }`}
            >
              <Icon className={`h-4 w-4 ${accent ? "text-purple-300" : "text-white/55"}`} />
            </div>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
            {hint ? <p className="mt-1 text-xs leading-relaxed text-white/40">{hint}</p> : null}
          </div>
        </header>
      ) : null}
      <div className={`${title ? "p-5" : "p-5"} space-y-4`}>{children}</div>
    </section>
  );
}

export function DashboardSubnav({
  items,
  active,
  onChange,
}: {
  items: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="inline-flex w-fit max-w-full flex-wrap gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1.5">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                : "text-white/55 hover:bg-white/[0.06] hover:text-white/80"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function DashboardSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35 pt-1">
      {children}
    </p>
  );
}

export function DashboardField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-white/55">{label}</label>
      {children}
    </div>
  );
}

export function DashboardColorField({
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
    <DashboardField label={label}>
      <ColorInput value={value} onChange={onChange} disabled={disabled} />
    </DashboardField>
  );
}

export function DashboardRangeSlider({
  label,
  value,
  min,
  max,
  step,
  formatValue,
  markers,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  markers?: { value: number; label: string }[];
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "pointer-events-none opacity-40" : ""}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="text-sm text-white/75">{label}</label>
        <span className="text-xs font-mono text-white/40">{formatValue(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="dashboard-range w-full"
      />
      {markers && markers.length > 0 ? (
        <div className="mt-2 flex justify-between text-[10px] text-white/30">
          {markers.map((marker) => (
            <button
              key={marker.value}
              type="button"
              onClick={() => onChange(marker.value)}
              className="transition-colors hover:text-purple-300"
            >
              {marker.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardToggle({
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
      className={`flex items-center justify-between gap-4 rounded-xl border border-white/[0.05] bg-black/20 px-4 py-3 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <span className="text-sm text-white/75">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.35)]" : "bg-white/10"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
