import type { CardLayout, LinkStyle, AvatarStyle, ProfileSettings } from "@/types/profile";

export const CARD_LAYOUT_OPTIONS: {
  value: CardLayout;
  label: string;
  description: string;
}[] = [
  {
    value: "classic",
    label: "Clásica",
    description: "Centrada, avatar arriba e iconos en cuadrícula.",
  },
  {
    value: "hero",
    label: "Hero",
    description: "Avatar grande, nombre destacado y fila de iconos.",
  },
  {
    value: "split",
    label: "Lateral",
    description: "Avatar a la izquierda y texto al lado.",
  },
  {
    value: "banner",
    label: "Banner",
    description: "Cabecera visual con avatar superpuesto.",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Poco contenedor; contenido flotando sobre el fondo.",
  },
  {
    value: "stack",
    label: "Stack",
    description: "Enlaces anchos tipo botón debajo del perfil.",
  },
  {
    value: "glass",
    label: "Cristal",
    description: "Panel ancho con pie dividido (visitas + redes).",
  },
];

export const LINK_STYLE_OPTIONS: {
  value: LinkStyle;
  label: string;
  description: string;
}[] = [
  {
    value: "icons",
    label: "Iconos",
    description: "Cuadrícula de iconos con hover.",
  },
  {
    value: "pills",
    label: "Botones",
    description: "Lista vertical de enlaces con etiqueta.",
  },
  {
    value: "row",
    label: "Fila",
    description: "Iconos en una sola fila compacta.",
  },
  {
    value: "chips",
    label: "Chips",
    description: "Píldoras pequeñas con icono y nombre.",
  },
];

export const AVATAR_STYLE_OPTIONS: {
  value: AvatarStyle;
  label: string;
}[] = [
  { value: "circle", label: "Circular" },
  { value: "ring", label: "Anillo" },
  { value: "rounded", label: "Redondeado" },
];

export function resolveCardLayout(settings: Partial<ProfileSettings>): CardLayout {
  const value = settings.cardLayout;
  if (value && CARD_LAYOUT_OPTIONS.some((o) => o.value === value)) return value;
  return "classic";
}

export function resolveLinkStyle(settings: Partial<ProfileSettings>): LinkStyle {
  const layout = resolveCardLayout(settings);
  const value = settings.linkStyle;

  if (layout === "minimal") return "row";
  if (layout === "stack") return value === "icons" || value === "row" ? "pills" : value ?? "pills";

  if (value && LINK_STYLE_OPTIONS.some((o) => o.value === value)) return value;
  return "icons";
}

export function resolveAvatarStyle(settings: Partial<ProfileSettings>): AvatarStyle {
  const value = settings.avatarStyle;
  if (value && AVATAR_STYLE_OPTIONS.some((o) => o.value === value)) return value;
  return "circle";
}

/** Sugerencias al cambiar layout (no forzado en UI, solo hints). */
export function suggestedSettingsForLayout(layout: CardLayout): Partial<ProfileSettings> {
  switch (layout) {
    case "minimal":
      return {
        transparentCard: true,
        showCardShadow: false,
        profileBlur: 0,
        linkStyle: "row",
      };
    case "stack":
      return { linkStyle: "pills", profileOpacity: 0.12, profileBlur: 24 };
    case "banner":
      return { linkStyle: "chips", showCardBorder: true };
    case "glass":
      return { linkStyle: "row", profileBlur: 28, gradientEnabled: true };
    case "hero":
      return { linkStyle: "row", nameEffect: "glow" };
    case "split":
      return { linkStyle: "icons" };
    default:
      return {};
  }
}
