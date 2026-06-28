import { noteMediaUserActivation } from "@/lib/media/media-gesture";
import { unmuteBackgroundVideoIfNeeded } from "@/lib/profile/profile-background-video-audio";
import { unlockProfileAudioIfNeeded } from "@/lib/profile/profile-audio-engine";

/** Activa el sonido en el gesto del usuario (video de fondo o pista subida). */
export function playProfileAudioFromGesture(): void {
  noteMediaUserActivation();
  unmuteBackgroundVideoIfNeeded();
  unlockProfileAudioIfNeeded();
}
