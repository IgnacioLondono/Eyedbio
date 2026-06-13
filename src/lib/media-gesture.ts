/** Marca interacción reciente del usuario (autoplay con sonido en navegación SPA). */
let lastActivation = 0;

export function noteMediaUserActivation(): void {
  lastActivation = Date.now();
}

export function hasRecentMediaUserActivation(windowMs = 2500): boolean {
  return Date.now() - lastActivation < windowMs;
}

export function installMediaGestureTracker(): () => void {
  if (typeof window === "undefined") return () => {};

  const note = () => noteMediaUserActivation();

  document.addEventListener("pointerdown", note, { capture: true });
  document.addEventListener("keydown", note, { capture: true });

  return () => {
    document.removeEventListener("pointerdown", note, { capture: true });
    document.removeEventListener("keydown", note, { capture: true });
  };
}
