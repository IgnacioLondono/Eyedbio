import type { Profile } from "@/types/profile";
import { noteMediaUserActivation, markMediaUnlockedSession } from "@/lib/media-gesture";
import {
  getEffectiveAudioClipDuration,
  getEffectiveAudioUrl,
  isBackgroundProfileAudio,
} from "@/lib/profile-audio";
import {
  startBackgroundVideoFromEnter,
  startBackgroundVideoMutedFromEnter,
} from "@/lib/profile-background-video-audio";
import {
  configureProfileAudioEngine,
  playProfileAudioFromUserGesture,
} from "@/lib/profile-audio-engine";

/** Inicia audio y video en el mismo gesto del usuario (pantalla de entrada). */
export function enterProfileFromGesture(profile: Profile): void {
  noteMediaUserActivation();
  markMediaUnlockedSession();

  const isVideoBackground = profile.backgroundType === "video";
  const backgroundVideoAudio =
    profile.audioEnabled && isBackgroundProfileAudio(profile);

  if (isVideoBackground) {
    if (backgroundVideoAudio) {
      startBackgroundVideoFromEnter();
    } else {
      startBackgroundVideoMutedFromEnter();
    }
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
