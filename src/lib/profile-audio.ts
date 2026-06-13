import { resolveBackgroundType } from "@/lib/media-config";
import type { AudioSource, Profile } from "@/types/profile";

export function backgroundHasAudio(profile: Pick<Profile, "settings" | "backgroundType">): boolean {
  const url = profile.settings.backgroundUrl?.trim();
  if (!url) return false;
  return resolveBackgroundType(url, profile.backgroundType) === "video";
}

export function resolveAudioSource(
  source: AudioSource | undefined,
  profile: Pick<Profile, "settings" | "backgroundType">
): AudioSource {
  if (source === "background" && backgroundHasAudio(profile)) {
    return "background";
  }
  return "upload";
}

export function getEffectiveAudioUrl(profile: Profile): string | undefined {
  if (!profile.audioEnabled) return undefined;

  if (resolveAudioSource(profile.audioSource, profile) === "background") {
    return profile.settings.backgroundUrl?.trim() || undefined;
  }

  return profile.audioUrl?.trim() || undefined;
}

export function hasPlayableProfileAudio(profile: Profile): boolean {
  return Boolean(getEffectiveAudioUrl(profile));
}
