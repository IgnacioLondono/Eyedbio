/** Marca interacción reciente del usuario (autoplay con sonido en navegación SPA). */
let lastActivation = 0;

const SESSION_UNLOCK_KEY = "eyed-media-unlocked";

export function noteMediaUserActivation(): void {
  lastActivation = Date.now();
}

export function hasRecentMediaUserActivation(windowMs = 2500): boolean {
  return Date.now() - lastActivation < windowMs;
}

export function markMediaUnlockedSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_UNLOCK_KEY, "1");
  } catch {
    /* modo privado */
  }
  noteMediaUserActivation();
}

export function hasMediaUnlockedSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

/** Edge / visitas con interacción previa en la misma sesión suelen permitir sonido al entrar. */
export function canAttemptUnmutedAutoplay(): boolean {
  return hasMediaUnlockedSession() || hasRecentMediaUserActivation(4000);
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
