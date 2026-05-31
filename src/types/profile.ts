export type SocialPlatform =
  | "discord"
  | "twitter"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "twitch"
  | "github"
  | "spotify"
  | "website";

export type BackgroundEffect = "none" | "snow" | "rain" | "stars";
export type BackgroundType = "image" | "video" | "gif";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  label?: string;
}

export interface ProfileSettings {
  backgroundUrl: string;
  backgroundEffect: BackgroundEffect;
  accentColor: string;
  profileOpacity: number;
  profileBlur: number;
  glowUsername: boolean;
  glowIcons: boolean;
  gradientEnabled: boolean;
  monochromeIcons: boolean;
  cursorUrl?: string;
}

export interface Profile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  backgroundType: BackgroundType;
  audioUrl?: string;
  audioEnabled: boolean;
  views: number;
  badges: string[];
  links: SocialLink[];
  settings: ProfileSettings;
  createdAt: string;
}

export const DEFAULT_SETTINGS: ProfileSettings = {
  backgroundUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c982?w=1920&q=80",
  backgroundEffect: "stars",
  accentColor: "#a855f7",
  profileOpacity: 0.15,
  profileBlur: 20,
  glowUsername: true,
  glowIcons: false,
  gradientEnabled: true,
  monochromeIcons: false,
};
