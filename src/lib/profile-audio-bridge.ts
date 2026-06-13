import { noteMediaUserActivation } from "@/lib/media-gesture";

/** Permite iniciar el audio del perfil en el mismo tick que un gesto del usuario. */
type GesturePlayFn = () => void;

let gesturePlay: GesturePlayFn | null = null;
let pendingGestureUnlock = false;

export function setProfileAudioGesturePlay(fn: GesturePlayFn | null): void {
  gesturePlay = fn;
  if (fn && pendingGestureUnlock) {
    pendingGestureUnlock = false;
    fn();
  }
}

export function playProfileAudioFromGesture(): void {
  noteMediaUserActivation();
  if (gesturePlay) {
    gesturePlay();
    pendingGestureUnlock = false;
    return;
  }
  pendingGestureUnlock = true;
}

export function consumePendingGestureUnlock(): boolean {
  if (!pendingGestureUnlock) return false;
  pendingGestureUnlock = false;
  return true;
}
