/** URL pública del sitio (NEXTAUTH_URL en producción). */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:9090";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }

  return `https://${raw.replace(/\/$/, "")}`;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** URL absoluta para avatares/imágenes en OG y crawlers. */
export function absoluteMediaUrl(url: string | undefined | null): string | null {
  if (!url?.trim()) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media/")) return absoluteUrl(url);
  if (url.startsWith("/api/media/")) return absoluteUrl(url.replace("/api/media", "/media"));
  return absoluteUrl(url.startsWith("/") ? url : `/${url}`);
}

export function profilePublicUrl(username: string): string {
  return absoluteUrl(`/${username.toLowerCase()}`);
}

export function profileOgImageUrl(username: string): string {
  return absoluteUrl(`/${username.toLowerCase()}/opengraph-image`);
}

export function profileStoryImageUrl(username: string): string {
  return absoluteUrl(`/${username.toLowerCase()}/story-image`);
}
