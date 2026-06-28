import { SocialPlatform } from "@/types/profile";

export type PlatformCategory = "social" | "gaming" | "other";

export const PLATFORM_CATEGORIES: {
  id: PlatformCategory;
  label: string;
  platforms: SocialPlatform[];
}[] = [
  {
    id: "social",
    label: "Redes sociales",
    platforms: [
      "discord",
      "twitter",
      "instagram",
      "youtube",
      "tiktok",
      "twitch",
      "spotify",
      "applemusic",
      "soundcloud",
      "github",
      "linkedin",
      "facebook",
      "telegram",
      "whatsapp",
      "reddit",
      "pinterest",
      "threads",
      "snapchat",
      "kick",
    ],
  },
  {
    id: "gaming",
    label: "Juegos y perfiles",
    platforms: [
      "steam",
      "roblox",
      "epicgames",
      "xbox",
      "playstation",
      "nintendo",
      "minecraft",
      "battlenet",
      "riotgames",
    ],
  },
  {
    id: "other",
    label: "Otros",
    platforms: ["email", "website"],
  },
];

export const ALL_PLATFORMS: SocialPlatform[] = PLATFORM_CATEGORIES.flatMap(
  (category) => category.platforms
);

export function getPlatformUrlPlaceholder(platform: SocialPlatform): string {
  const placeholders: Partial<Record<SocialPlatform, string>> = {
    discord: "tu_usuario",
    email: "mailto:tu@email.com",
    steam: "https://steamcommunity.com/id/tu-usuario",
    roblox: "https://www.roblox.com/users/123456789/profile",
    epicgames: "tu_usuario",
    xbox: "https://account.xbox.com/es-ES/Profile?gamertag=TuGamertag",
    playstation: "https://psnprofiles.com/tu-usuario",
    nintendo: "https://nintendoeverything.com/...",
    minecraft: "https://namemc.com/profile/tu-usuario.1",
    battlenet: "https://battle.net/support/es/profile/tu-usuario",
    riotgames: "https://tracker.gg/valorant/profile/riot/TuUsuario",
    kick: "https://kick.com/tu-usuario",
  };

  return placeholders[platform] ?? "https://...";
}
