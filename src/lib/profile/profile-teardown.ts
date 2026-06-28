import { destroyProfileAudioEngine } from "@/lib/profile/profile-audio-engine";
import { resetBackgroundVideoAudioState } from "@/lib/profile/profile-background-video-audio";

export const PROFILE_VIEW_ROOT_ATTR = "data-eyed-profile-view";

/** Detiene audio/video del perfil al salir de la ruta pública. */
export function teardownProfilePresentation(): void {
  resetBackgroundVideoAudioState();
  destroyProfileAudioEngine();

  if (typeof document === "undefined") return;

  const root = document.querySelector(`[${PROFILE_VIEW_ROOT_ATTR}]`);
  if (!root) return;

  root.querySelectorAll("video").forEach((element) => {
    try {
      element.pause();
    } catch {
      /* ignore */
    }
  });
}
