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

export type BackgroundEffect = "none" | "snow" | "rain" | "stars";
export type BackgroundType = "image" | "video" | "gif";
export type NameEffect = "none" | "glow" | "aura" | "neon" | "pulse" | "gradient";

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
  accentColor: string;
  cardColor: string;
  cardColorSecondary: string;
  textColor: string;
  profileOpacity: number;
  profileBlur: number;
  /** @deprecated Usar nameEffect */
  glowUsername?: boolean;
  nameEffect: NameEffect;
  glowIcons: boolean;
  gradientEnabled: boolean;
  monochromeIcons: boolean;
  transparentCard: boolean;
  showCardBorder: boolean;
  showCardShadow: boolean;
  borderOpacity: number;
  cursorUrl?: string;
}

export interface Profile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  backgroundType: BackgroundType;
  audioUrl?: string;
  audioStartTime: number;
  audioEnabled: boolean;
  views: number;
  badges: string[];
  links: SocialLink[];
  settings: ProfileSettings;
  createdAt: string;
}

export const DEFAULT_SETTINGS: ProfileSettings = {
  backgroundUrl: "",
  backgroundEffect: "stars",
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
};
