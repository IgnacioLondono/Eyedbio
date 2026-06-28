import type { MediaFocus } from "@/lib/media/media-focus";
import type { PageOverlay } from "@/lib/profile/profile-overlay-config";

export type { MediaFocus } from "@/lib/media/media-focus";

export type SocialPlatform =
  | "discord"
  | "twitter"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "twitch"
  | "github"
  | "spotify"
  | "applemusic"
  | "linkedin"
  | "facebook"
  | "telegram"
  | "whatsapp"
  | "soundcloud"
  | "reddit"
  | "pinterest"
  | "threads"
  | "snapchat"
  | "kick"
  | "steam"
  | "roblox"
  | "epicgames"
  | "xbox"
  | "playstation"
  | "nintendo"
  | "minecraft"
  | "battlenet"
  | "riotgames"
  | "email"
  | "website"
  | "custom";

export type BackgroundEffect =
  | "none"
  | "snow"
  | "rain"
  | "stars"
  | "aurora"
  | "fireflies"
  | "bubbles"
  | "nebula"
  | "galaxy"
  | "comets"
  | "meteors"
  | "cosmic_dust"
  | "satellites";
export type BackgroundType = "image" | "video" | "gif";
export type AudioSource = "upload" | "background";
export type NameEffect = "none" | "glow" | "aura" | "neon" | "pulse" | "gradient";

/** Animación letra a letra del nombre en la tarjeta */
export type NameAnimation =
  | "none"
  | "typewriter"
  | "wave"
  | "bounce"
  | "shimmer"
  | "glitch";

/** Estructura / composición de la tarjeta de perfil */
export type CardLayout =
  | "classic"
  | "hero"
  | "split"
  | "banner"
  | "minimal"
  | "stack"
  | "glass"
  | "bar";

/** Cómo se muestran los enlaces sociales */
export type LinkStyle = "icons" | "pills" | "row" | "chips";

export type AvatarStyle = "circle" | "ring" | "rounded";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  label?: string;
  iconUrl?: string;
}

export interface ProfileSettings {
  backgroundUrl: string;
  backgroundEffect: BackgroundEffect;
  /** Oscurecimiento sobre imagen/video de fondo (0–1) */
  backgroundDim?: number;
  /** Efecto visual sobre el fondo: scanlines, grain, viñeta */
  pageOverlay?: PageOverlay;
  accentColor: string;
  cardColor: string;
  cardColorSecondary: string;
  textColor: string;
  profileOpacity: number;
  profileBlur: number;
  /** @deprecated Usar nameEffect */
  glowUsername?: boolean;
  nameEffect: NameEffect;
  /** Animación del nombre en la tarjeta (independiente del efecto visual) */
  nameAnimation?: NameAnimation;
  glowIcons: boolean;
  gradientEnabled: boolean;
  monochromeIcons: boolean;
  /** Colorear todos los iconos con un solo color (sustituye monochromeIcons) */
  iconColorMode?: "platform" | "unified";
  /** Color unificado de iconos de plataforma */
  iconColor?: string;
  /** Color de iconos personalizados subidos por enlace */
  customLinkIconColor?: string;
  /** Fondo de los botones de icono */
  iconBackgroundColor?: string;
  /** Forma del contenedor de iconos de enlaces */
  iconShape?: "rounded" | "circle" | "square" | "none";
  /** Forma del icono junto al nombre */
  profileNameIconShape?: "rounded" | "circle" | "square";
  /** Borde del icono junto al nombre */
  profileNameIconRingColor?: string;
  transparentCard: boolean;
  showCardBorder: boolean;
  showCardShadow: boolean;
  borderOpacity: number;
  cursorUrl?: string;
  /** Imagen de cabecera cuando cardLayout es "banner" */
  bannerUrl?: string;
  /** Encuadre (posición y zoom al mostrar; no modifica el archivo) */
  avatarFocus?: MediaFocus;
  bannerFocus?: MediaFocus;
  backgroundFocus?: MediaFocus;
  cardLayout: CardLayout;
  linkStyle: LinkStyle;
  avatarStyle: AvatarStyle;
  /** Pantalla "click to enter" antes de mostrar el perfil */
  entryGateEnabled?: boolean;
  entryGateText?: string;
  /** Título personalizado de la pestaña del navegador (ej. @usuario) */
  browserTabTitle?: string;
  /** Icono de la pestaña del navegador (favicon) */
  browserTabIconUrl?: string;
  /** Icono junto al nombre en la tarjeta del perfil */
  profileNameIconUrl?: string;
  /** Mostrar contador de visitas en la tarjeta */
  showViewCount?: boolean;
  /** Mostrar botón compartir en el perfil público */
  showShareButton?: boolean;
  /** Ubicación visible en el perfil (ej. México 🇲🇽) */
  location?: string;
  showLocation?: boolean;
  /** Widget de presencia de Discord (Lanyard) */
  discordPresenceEnabled?: boolean;
  /** ID numérico de Discord (snowflake) */
  discordUserId?: string;
  /** Respaldo en settings si la columna de BD no está migrada */
  audioStartTime?: number;
  audioClipDuration?: number;
}

export interface Profile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  backgroundType: BackgroundType;
  audioUrl?: string;
  audioStartTime: number;
  audioClipDuration: number;
  audioEnabled: boolean;
  audioSource: AudioSource;
  views: number;
  badges: string[];
  links: SocialLink[];
  settings: ProfileSettings;
  locale: "es" | "en";
  createdAt: string;
  /** ISO; para detectar ediciones concurrentes al guardar */
  updatedAt?: string;
}

export const DEFAULT_SETTINGS: ProfileSettings = {
  backgroundUrl: "",
  backgroundEffect: "stars",
  backgroundDim: 0.5,
  pageOverlay: "none",
  accentColor: "#a855f7",
  cardColor: "#ffffff",
  cardColorSecondary: "#a855f7",
  textColor: "#ffffff",
  profileOpacity: 0.15,
  profileBlur: 20,
  nameEffect: "glow",
  glowIcons: false,
  gradientEnabled: true,
  monochromeIcons: false,
  transparentCard: false,
  showCardBorder: true,
  showCardShadow: true,
  borderOpacity: 0.2,
  bannerUrl: "",
  avatarFocus: { x: 50, y: 50, zoom: 1 },
  bannerFocus: { x: 50, y: 50, zoom: 1 },
  backgroundFocus: { x: 50, y: 50, zoom: 1 },
  cardLayout: "classic",
  linkStyle: "icons",
  avatarStyle: "circle",
};
