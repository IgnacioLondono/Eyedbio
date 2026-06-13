import type { BackgroundType } from "@/types/profile";
import { resolveBackgroundType } from "@/lib/media-config";

export function isLocalMediaUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.startsWith("/media/") ||
    url.startsWith("/api/media/") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  );
}

/** URL final para mostrar: locales directas, externas vía proxy (solo imágenes). */
export function getMediaSrc(url: string): string {
  if (!url?.trim()) return url;

  if (isLocalMediaUrl(url)) return url;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (/\.(mp4|webm|mov|mp3|wav|ogg|m4a|aac|flac|opus|aiff?|weba|mid(i)?)(\?|$)/i.test(url)) {
      return url;
    }
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
}

export function isExternalMediaUrl(url: string): boolean {
  return Boolean(url?.trim()) && !isLocalMediaUrl(url) && /^https?:\/\//i.test(url);
}

/** Precarga la música del perfil antes de montar el reproductor. */
export function preloadProfileAudio(url: string): void {
  if (typeof window === "undefined" || !url?.trim()) return;

  const src = getMediaSrc(url);
  const audio = document.createElement("audio");
  audio.preload = "auto";
  audio.src = src;
  audio.load();
}

/** Precarga el fondo en segundo plano para que aparezca antes en el perfil. */
export function preloadBackgroundMedia(url: string, type: BackgroundType): void {
  if (typeof window === "undefined" || !url?.trim()) return;

  const src = getMediaSrc(url);
  const mediaType = resolveBackgroundType(url, type);

  if (mediaType === "video") {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.src = src;
    video.load();
    return;
  }

  const img = new Image();
  img.fetchPriority = "high";
  img.src = src;
}
