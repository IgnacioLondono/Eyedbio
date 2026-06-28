export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export interface LanyardActivity {
  type: number;
  name: string;
  state?: string | null;
  details?: string | null;
}

export interface LanyardDiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  discriminator: string;
}

export interface LanyardSpotify {
  song: string;
  artist: string;
  album: string;
}

export interface LanyardPresence {
  discord_user: LanyardDiscordUser;
  discord_status: DiscordStatus;
  activities: LanyardActivity[];
  spotify?: LanyardSpotify | null;
}

export interface LanyardApiResponse {
  success: boolean;
  data?: LanyardPresence;
}

const DISCORD_SNOWFLAKE = /^\d{17,20}$/;

export function isValidDiscordUserId(value: string): boolean {
  return DISCORD_SNOWFLAKE.test(value.trim());
}

export function discordAvatarUrl(user: LanyardDiscordUser): string {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
  }

  const defaultIndex =
    user.discriminator && user.discriminator !== "0"
      ? Number(user.discriminator) % 5
      : Number((BigInt(user.id) >> BigInt(22)) % BigInt(6));

  return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
}

export function discordDisplayName(user: LanyardDiscordUser): string {
  return user.global_name?.trim() || user.username;
}

export function discordStatusColor(status: DiscordStatus): string {
  switch (status) {
    case "online":
      return "#23a559";
    case "idle":
      return "#f0b232";
    case "dnd":
      return "#f23f43";
    default:
      return "#80848e";
  }
}

export function formatPresenceActivity(
  data: LanyardPresence,
  locale: "es" | "en"
): string | null {
  const custom = data.activities.find((activity) => activity.type === 4);
  if (custom?.state?.trim()) return custom.state.trim();

  if (data.spotify?.song) {
    return locale === "es"
      ? `Escuchando ${data.spotify.song}`
      : `Listening to ${data.spotify.song}`;
  }

  const playing = data.activities.find((activity) => activity.type === 0);
  if (playing?.name) {
    return locale === "es" ? `Jugando ${playing.name}` : `Playing ${playing.name}`;
  }

  const listening = data.activities.find((activity) => activity.type === 2);
  if (listening?.details?.trim()) {
    return locale === "es"
      ? `Escuchando ${listening.details}`
      : `Listening to ${listening.details}`;
  }
  if (listening?.name?.trim()) {
    return locale === "es"
      ? `Escuchando ${listening.name}`
      : `Listening to ${listening.name}`;
  }

  const watching = data.activities.find((activity) => activity.type === 3);
  if (watching?.name) {
    return locale === "es" ? `Viendo ${watching.name}` : `Watching ${watching.name}`;
  }

  return null;
}

export async function fetchLanyardPresence(userId: string): Promise<LanyardPresence | null> {
  const id = userId.trim();
  if (!isValidDiscordUserId(id)) return null;

  const res = await fetch(`https://api.lanyard.rest/v1/users/${id}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const body = (await res.json()) as LanyardApiResponse;
  if (!body.success || !body.data) return null;

  return body.data;
}

export function proxiedDiscordAvatarUrl(url: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}
