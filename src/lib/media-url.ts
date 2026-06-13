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
