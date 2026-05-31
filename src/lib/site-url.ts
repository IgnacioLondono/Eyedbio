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

function isPrivateHost(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  return (
    hostname === "localhost" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}

/** Host real de la petición (Cloudflare, nginx). Prioriza dominio público sobre IP local. */
export async function getSiteUrlFromHeaders(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();

  const forwardedHost = h.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || h.get("host")?.split(",")[0]?.trim();

  if (!host) return getSiteUrl();

  if (isPrivateHost(host)) {
    const envUrl = getSiteUrl();
    try {
      const envHost = new URL(envUrl).hostname;
      if (!isPrivateHost(envHost)) return envUrl;
    } catch {
      /* ignore */
    }
  }

  const forwardedProto = h.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    forwardedProto ||
    (isPrivateHost(host) ? "http" : "https");

  return `${proto}://${host}`.replace(/\/$/, "");
}

export function absoluteUrl(path: string, base?: string): string {
  const siteBase = (base ?? getSiteUrl()).replace(/\/$/, "");
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteBase}${path.startsWith("/") ? path : `/${path}`}`;
}

/** URL absoluta para avatares/imágenes en OG y crawlers. */
export function absoluteMediaUrl(
  url: string | undefined | null,
  base?: string
): string | null {
  if (!url?.trim()) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media/")) return absoluteUrl(url, base);
  if (url.startsWith("/api/media/")) {
    return absoluteUrl(url.replace("/api/media", "/media"), base);
  }
  return absoluteUrl(url.startsWith("/") ? url : `/${url}`, base);
}

export function profilePublicUrl(username: string, base?: string): string {
  return absoluteUrl(`/${username.toLowerCase()}`, base);
}

export function profileOgImageUrl(username: string, base?: string): string {
  return absoluteUrl(`/${username.toLowerCase()}/opengraph-image`, base);
}

export function profileStoryImageUrl(username: string, base?: string): string {
  return absoluteUrl(`/${username.toLowerCase()}/story-image`, base);
}
