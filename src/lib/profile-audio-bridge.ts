import { noteMediaUserActivation } from "@/lib/media-gesture";
import { playProfileAudioFromUserGesture } from "@/lib/profile-audio-engine";

/** Inicia o desbloquea el audio en el mismo tick que un gesto del usuario. */
export function playProfileAudioFromGesture(): void {
  noteMediaUserActivation();
  playProfileAudioFromUserGesture();
}
