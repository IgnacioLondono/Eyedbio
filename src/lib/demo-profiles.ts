import { Profile } from "@/types/profile";
import { DEFAULT_SETTINGS } from "@/types/profile";

const baseLinks = [
  { id: "d1", platform: "discord" as const, url: "mi_usuario", label: "Discord" },
  { id: "d2", platform: "instagram" as const, url: "https://instagram.com", label: "Instagram" },
  { id: "d3", platform: "github" as const, url: "https://github.com", label: "GitHub" },
  { id: "d4", platform: "spotify" as const, url: "https://spotify.com", label: "Spotify" },
];

function demoProfile(
  id: string,
  overrides: Partial<Omit<Profile, "settings">> & { settings: Partial<Profile["settings"]> }
): Profile {
  const { settings: settingsOverride, ...rest } = overrides;
  return {
    username: id,
    displayName: rest.displayName ?? "Creador",
    bio: rest.bio ?? "Bienvenido a mi página ✦",
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    backgroundType: "image",
    audioEnabled: false,
    audioStartTime: 0,
    audioClipDuration: 30,
    audioSource: "upload",
    views: 12840,
    badges: ["verified"],
    links: baseLinks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...rest,
    locale: rest.locale ?? "es",
    settings: {
      ...DEFAULT_SETTINGS,
      backgroundUrl: "",
      backgroundEffect: "stars",
      ...settingsOverride,
    },
  };
}

export const LANDING_STYLE_DEMOS: Profile[] = [
  demoProfile("nova", {
    displayName: "Nova",
    bio: "Diseño · música · código",
    settings: {
      cardLayout: "banner",
      linkStyle: "chips",
      avatarStyle: "ring",
      accentColor: "#818cf8",
      cardColor: "#1e1b4b",
      cardColorSecondary: "#312e81",
      gradientEnabled: true,
      profileOpacity: 0.35,
      profileBlur: 20,
      nameEffect: "glow",
      backgroundEffect: "aurora",
      bannerUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&h=240&fit=crop&q=80",
    },
  }),
  demoProfile("kira", {
    displayName: "Kira",
    bio: "Enlaces abajo, estilo limpio",
    settings: {
      cardLayout: "stack",
      linkStyle: "pills",
      avatarStyle: "circle",
      accentColor: "#34d399",
      cardColor: "#064e3b",
      profileOpacity: 0.2,
      profileBlur: 28,
      monochromeIcons: false,
      backgroundEffect: "none",
    },
  }),
  demoProfile("echo", {
    displayName: "Echo",
    bio: "Solo lo esencial",
    settings: {
      cardLayout: "minimal",
      linkStyle: "row",
      avatarStyle: "rounded",
      transparentCard: true,
      showCardBorder: false,
      showCardShadow: false,
      profileBlur: 0,
      profileOpacity: 0,
      accentColor: "#f472b6",
      textColor: "#fafafa",
      nameEffect: "neon",
      backgroundEffect: "fireflies",
    },
  }),
  demoProfile("axis", {
    displayName: "Axis",
    bio: "Panel lateral con visitas",
    settings: {
      cardLayout: "glass",
      linkStyle: "row",
      avatarStyle: "circle",
      accentColor: "#a855f7",
      cardColor: "#2e1065",
      cardColorSecondary: "#4c1d95",
      gradientEnabled: true,
      profileOpacity: 0.25,
      profileBlur: 32,
      glowIcons: true,
      backgroundEffect: "stars",
    },
  }),
];
