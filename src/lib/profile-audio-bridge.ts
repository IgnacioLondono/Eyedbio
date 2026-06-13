import { noteMediaUserActivation } from "@/lib/media-gesture";
import { unlockProfileAudioIfNeeded } from "@/lib/profile-audio-engine";

/** Desbloquea el audio solo si hace falta, en el mismo tick que un gesto del usuario. */
export function playProfileAudioFromGesture(): void {
  noteMediaUserActivation();
  unlockProfileAudioIfNeeded();
}
