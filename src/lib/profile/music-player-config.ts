import type { Profile, ProfileSettings } from "@/types/profile";
import { getEffectiveAudioUrl } from "@/lib/profile/profile-audio";

export interface ResolvedMusicPlayer {
  title: string;
  artist: string;
  coverUrl: string;
  baseColor: string;
  textColor: string;
}

export function isMusicPlayerEnabled(settings: ProfileSettings): boolean {
  return Boolean(settings.musicPlayerEnabled);
}

/** URL de audio reproducible por el widget (solo fuente "upload"). */
export function getMusicPlayerAudioUrl(profile: Profile): string | undefined {
  if (profile.audioSource === "background") return undefined;
  return getEffectiveAudioUrl(profile);
}

/** True si el reproductor puede reproducir audio real (perfil público). */
export function isMusicPlayerPlayable(profile: Profile): boolean {
  return (
    isMusicPlayerEnabled(profile.settings) &&
    profile.audioEnabled &&
    Boolean(getMusicPlayerAudioUrl(profile))
  );
}

export function resolveMusicPlayer(profile: Profile): ResolvedMusicPlayer {
  const { settings } = profile;
  return {
    title: settings.musicPlayerTitle?.trim() || profile.displayName || profile.username,
    artist: settings.musicPlayerArtist?.trim() || `@${profile.username}`,
    coverUrl: settings.musicPlayerCoverUrl?.trim() || profile.avatarUrl,
    baseColor:
      settings.musicPlayerColor?.trim() ||
      settings.accentColor?.trim() ||
      "#a855f7",
    textColor: settings.musicPlayerTextColor?.trim() || settings.textColor || "#ffffff",
  };
}
