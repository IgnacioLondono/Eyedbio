import type { Profile } from "@/types/profile";
import { resolveBackgroundType } from "@/lib/media/media-config";
import { noteMediaUserActivation, markMediaUnlockedSession } from "@/lib/media/media-gesture";
import {
  getEffectiveAudioClipDuration,
  getEffectiveAudioUrl,
  isBackgroundProfileAudio,
} from "@/lib/profile/profile-audio";
import { playProfileBackgroundVideo } from "@/lib/profile/profile-background-video-audio";
import {
  configureProfileAudioEngine,
  playProfileAudioFromUserGesture,
} from "@/lib/profile/profile-audio-engine";

/** Inicia video y audio en el gesto de entrada. */
export function enterProfileFromGesture(profile: Profile): void {
  noteMediaUserActivation();
  markMediaUnlockedSession();

  const isVideoBackground =
    resolveBackgroundType(profile.settings.backgroundUrl ?? "", profile.backgroundType) ===
    "video";
  const backgroundVideoAudio =
    profile.audioEnabled && isBackgroundProfileAudio(profile);

  if (isVideoBackground) {
    playProfileBackgroundVideo({ withAudio: backgroundVideoAudio, fromGesture: true });
  }

  if (!profile.audioEnabled || backgroundVideoAudio) return;

  const url = getEffectiveAudioUrl(profile);
  if (!url) return;

  configureProfileAudioEngine({
    src: url,
    startTime: profile.audioStartTime,
    clipDuration: getEffectiveAudioClipDuration(profile),
    enabled: true,
  });
  playProfileAudioFromUserGesture();
}
