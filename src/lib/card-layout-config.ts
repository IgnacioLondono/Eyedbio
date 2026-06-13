import type { CardLayout, LinkStyle, AvatarStyle, Profile, ProfileSettings } from "@/types/profile";
import { DEFAULT_SETTINGS } from "@/types/profile";

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

const THUMBNAIL_LINKS: Profile["links"] = [
  { id: "p1", platform: "discord", url: "eyedbio", label: "Discord" },
  { id: "p2", platform: "instagram", url: "https://eyed.bio" },
  { id: "p3", platform: "github", url: "https://eyed.bio" },
];

/** Perfil estático para miniaturas del selector (misma tarjeta que la vista previa). */
export function getLayoutThumbnailProfile(layout: CardLayout): Profile {
  const suggestions = suggestedSettingsForLayout(layout);
  const settings: ProfileSettings = {
    ...DEFAULT_SETTINGS,
    backgroundEffect: "none",
    accentColor: "#a855f7",
    textColor: "#ffffff",
    cardColor: "#1a1a2e",
    cardColorSecondary: "#4c1d95",
    ...suggestions,
    cardLayout: layout,
    linkStyle: resolveLinkStyle({ cardLayout: layout, ...suggestions }),
    profileOpacity:
      layout === "minimal" ? 0 : (suggestions.profileOpacity ?? DEFAULT_SETTINGS.profileOpacity),
    profileBlur:
      layout === "minimal" ? 0 : (suggestions.profileBlur ?? DEFAULT_SETTINGS.profileBlur),
    bannerUrl:
      layout === "banner"
        ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&h=200&fit=crop&q=80"
        : "",
  };

  return {
    username: "preview",
    displayName: "Nombre",
    bio: "Tu biografía",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=eyed-thumb",
    backgroundType: "image",
    audioEnabled: false,
    audioStartTime: 0,
    views: 999,
    badges: [],
    links: THUMBNAIL_LINKS,
    createdAt: "",
    locale: "es",
    settings,
  };
}
