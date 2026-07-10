import { SocialPlatform } from "@/types/profile";

export type PlatformCategory = "social" | "gaming" | "other";

/** Orden del selector de enlaces (estilo guns.lol). */
export const LINK_PICKER_PLATFORMS: SocialPlatform[] = [
  "snapchat",
  "youtube",
  "discord",
  "spotify",
  "instagram",
  "twitter",
  "tiktok",
  "telegram",
  "soundcloud",
  "paypal",
  "github",
  "roblox",
  "playstation",
  "xbox",
  "applemusic",
  "gitlab",
  "twitch",
  "reddit",
  "vk",
  "bluesky",
  "linkedin",
  "steam",
  "kick",
  "pinterest",
  "kofi",
  "facebook",
  "threads",
  "patreon",
  "signal",
  "whatsapp",
  "epicgames",
  "email",
];

export const PLATFORM_CATEGORIES: {
  id: PlatformCategory;
  label: string;
  platforms: SocialPlatform[];
}[] = [
  {
    id: "social",
    label: "Redes sociales",
    platforms: [
      "snapchat",
      "youtube",
      "discord",
      "spotify",
      "instagram",
      "twitter",
      "tiktok",
      "telegram",
      "soundcloud",
      "paypal",
      "github",
      "gitlab",
      "twitch",
      "reddit",
      "vk",
      "bluesky",
      "linkedin",
      "kick",
      "pinterest",
      "kofi",
      "facebook",
      "threads",
      "patreon",
      "signal",
      "whatsapp",
    ],
  },
  {
    id: "gaming",
    label: "Juegos y perfiles",
    platforms: ["roblox", "playstation", "xbox", "applemusic", "steam", "epicgames"],
  },
  {
    id: "other",
    label: "Otros",
    platforms: ["email"],
  },
];

export const ALL_PLATFORMS = [
  ...new Set<SocialPlatform>([
    ...LINK_PICKER_PLATFORMS,
    "minecraft",
    "battlenet",
    "riotgames",
    "nintendo",
    "website",
    "custom",
  ]),
];

export function getPlatformUrlPlaceholder(platform: SocialPlatform): string {
  const placeholders: Partial<Record<SocialPlatform, string>> = {
    discord: "tu_usuario",
    epicgames: "tu_usuario",
    email: "mailto:tu@email.com",
    steam: "https://steamcommunity.com/id/tu-usuario",
    roblox: "https://www.roblox.com/users/123456789/profile",
    xbox: "https://account.xbox.com/es-ES/Profile?gamertag=TuGamertag",
    playstation: "https://psnprofiles.com/tu-usuario",
    kick: "https://kick.com/tu-usuario",
    paypal: "https://paypal.me/tu-usuario",
    gitlab: "https://gitlab.com/tu-usuario",
    bluesky: "https://bsky.app/profile/tu-usuario.bsky.social",
    patreon: "https://patreon.com/tu-usuario",
    kofi: "https://ko-fi.com/tu-usuario",
    signal: "https://signal.me/#p/+34123456789",
    vk: "https://vk.com/tu-usuario",
  };

  return placeholders[platform] ?? "https://...";
}
