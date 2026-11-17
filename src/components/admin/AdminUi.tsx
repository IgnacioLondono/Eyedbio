"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

export function AdminPage({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">{children}</div>;
}

export function AdminPageHeader({
  title,
  description,
  icon,
  actions,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {icon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/15 to-orange-500/5 text-rose-200 shadow-lg shadow-rose-950/20">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-300/50">
            Administración
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function AdminStatsGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{children}</div>
  );
}

export function AdminStatCard({
  label,
  value,
  icon,
  href,
  highlight,
  loading,
}: {
  label: string;
  value?: number;
  icon: ReactNode;
  href?: string;
  highlight?: boolean;
  loading?: boolean;
}) {
  const inner = (
    <>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div
          className={`rounded-xl p-2.5 ${
            highlight
              ? "bg-amber-500/15 text-amber-300"
              : "bg-white/[0.04] text-rose-300/90"
          }`}
        >
          {icon}
        </div>
        {href ? <ArrowRight className="h-4 w-4 text-white/15" /> : null}
      </div>
      <div className="text-3xl font-bold tabular-nums tracking-tight text-white">
        {loading ? "—" : (value ?? 0).toLocaleString("es-ES")}
      </div>
      <p className="mt-1 text-sm text-white/40">{label}</p>
    </>
  );

  const className = `group rounded-2xl border p-5 transition-all duration-200 ${
    highlight
      ? "border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] to-transparent hover:border-amber-500/40"
      : "border-white/[0.07] bg-[#0f0f16]/80 hover:border-rose-500/20 hover:bg-[#12121c]"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function AdminSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#0c0c14]/90 overflow-hidden">
      <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-relaxed text-white/40">{description}</p> : null}
      </div>
      <div className="divide-y divide-white/[0.05]">{children}</div>
    </section>
  );
}

export function AdminToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
      <div className="min-w-0 pr-2">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-white/40">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
          checked ? "bg-rose-600" : "bg-white/10"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export function AdminQuickActions({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function AdminActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-white/[0.07] bg-[#0f0f16]/80 p-5 transition-all hover:border-rose-500/25 hover:bg-[#12121c]"
    >
      <div className="mb-4 inline-flex w-fit rounded-xl bg-rose-500/10 p-2.5 text-rose-300 group-hover:bg-rose-500/15">
        {icon}
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-white/45">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-rose-300/80 group-hover:text-rose-200">
        Abrir
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function AdminAlert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

  return (
    <p className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</p>
  );
}

export function AdminPrimaryButton({
  children,
  onClick,
  disabled,
  loading,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-950/30 transition hover:from-rose-500 hover:to-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function AdminPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-[#0c0c14]/90 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  buttonLabel = "Buscar",
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  buttonLabel?: string;
}) {
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-rose-500/40 focus:outline-none focus:ring-1 focus:ring-rose-500/20"
      />
      <button
        type="submit"
        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20"
      >
        {buttonLabel}
      </button>
    </form>
  );
}

export function AdminTableShell({ children }: { children: ReactNode }) {
  return (
    <AdminPanel>
      <div className="overflow-x-auto">{children}</div>
    </AdminPanel>
  );
}

export function AdminSkeleton({ className = "h-40" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02] ${className}`} />
  );
}
