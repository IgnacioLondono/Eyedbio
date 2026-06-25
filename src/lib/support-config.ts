export const SUPPORT_CATEGORIES = [
  "account",
  "profile",
  "media",
  "bug",
  "other",
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export const OPEN_SUPPORT_STATUSES: SupportStatus[] = ["open", "in_progress"];

export const MAX_OPEN_TICKETS_PER_USER = 5;
export const MIN_SUPPORT_MESSAGE_LENGTH = 10;
export const MAX_SUPPORT_MESSAGE_LENGTH = 4000;
export const MAX_SUPPORT_SUBJECT_LENGTH = 120;

export function isSupportCategory(value: string): value is SupportCategory {
  return (SUPPORT_CATEGORIES as readonly string[]).includes(value);
}

export function isSupportStatus(value: string): value is SupportStatus {
  return (SUPPORT_STATUSES as readonly string[]).includes(value);
}

export function supportCategoryLabel(category: SupportCategory, locale: "es" | "en"): string {
  const labels: Record<SupportCategory, { es: string; en: string }> = {
    account: { es: "Cuenta y acceso", en: "Account & login" },
    profile: { es: "Perfil y diseño", en: "Profile & design" },
    media: { es: "Medios y audio", en: "Media & audio" },
    bug: { es: "Error o fallo", en: "Bug or error" },
    other: { es: "Otro", en: "Other" },
  };
  return labels[category][locale];
}

export function supportStatusLabel(status: SupportStatus, locale: "es" | "en"): string {
  const labels: Record<SupportStatus, { es: string; en: string }> = {
    open: { es: "Abierto", en: "Open" },
    in_progress: { es: "En revisión", en: "In progress" },
    resolved: { es: "Resuelto", en: "Resolved" },
    closed: { es: "Cerrado", en: "Closed" },
  };
  return labels[status][locale];
}

export function supportStatusTone(status: SupportStatus): string {
  switch (status) {
    case "open":
      return "bg-amber-500/15 text-amber-200 border-amber-500/25";
    case "in_progress":
      return "bg-blue-500/15 text-blue-200 border-blue-500/25";
    case "resolved":
      return "bg-emerald-500/15 text-emerald-200 border-emerald-500/25";
    default:
      return "bg-white/10 text-white/50 border-white/15";
  }
}
