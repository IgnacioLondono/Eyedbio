/** Permite iniciar el audio del perfil en el mismo tick que un gesto del usuario. */
type GesturePlayFn = () => void;

let gesturePlay: GesturePlayFn | null = null;

export function setProfileAudioGesturePlay(fn: GesturePlayFn | null): void {
  gesturePlay = fn;
}

export function playProfileAudioFromGesture(): void {
  gesturePlay?.();
}
