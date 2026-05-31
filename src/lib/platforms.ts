import { SocialPlatform } from "@/types/profile";

export const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { label: string; color: string }
> = {
  discord: { label: "Discord", color: "#5865F2" },
  twitter: { label: "Twitter / X", color: "#1DA1F2" },
  instagram: { label: "Instagram", color: "#E4405F" },
  youtube: { label: "YouTube", color: "#FF0000" },
  tiktok: { label: "TikTok", color: "#ffffff" },
  twitch: { label: "Twitch", color: "#9146FF" },
  github: { label: "GitHub", color: "#ffffff" },
  spotify: { label: "Spotify", color: "#1DB954" },
  website: { label: "Website", color: "#a855f7" },
};
