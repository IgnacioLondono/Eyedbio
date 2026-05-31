import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

const RASTER_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "image/*" },
    });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "image/png";
    if (contentType.includes("svg")) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0) return null;

    return `data:${contentType.split(";")[0]};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Convierte avatar a data URL para next/og (nunca URLs externas en runtime de Satori). */
export async function resolveOgAvatarSrc(
  avatarUrl: string | undefined | null,
  siteBase: string
): Promise<string | null> {
  if (!avatarUrl?.trim()) return null;

  let normalized = avatarUrl.trim();

  if (normalized.includes("dicebear.com") && normalized.includes("/svg")) {
    normalized = normalized.replace("/svg", "/png");
  }

  if (/\.svg(\?|$)/i.test(normalized)) {
    return null;
  }

  const mediaMatch = normalized.match(/^\/(?:api\/)?media\/(.+)$/);
  if (mediaMatch) {
    const relativePath = mediaMatch[1];
    const ext = path.extname(relativePath).toLowerCase();
    if (!RASTER_EXT.has(ext)) return null;

    try {
      const filePath = path.join(UPLOAD_ROOT, relativePath);
      const buffer = await readFile(filePath);
      const mime =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
              ? "image/gif"
              : "image/jpeg";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    } catch {
      const base = siteBase.replace(/\/$/, "");
      const publicPath = normalized.replace("/api/media", "/media");
      return fetchImageAsDataUrl(`${base}${publicPath}`);
    }
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return fetchImageAsDataUrl(normalized);
  }

  const base = siteBase.replace(/\/$/, "");
  const absolute = `${base}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
  return fetchImageAsDataUrl(absolute);
}

export async function resolveOgImageSrc(
  imageUrl: string,
  siteBase?: string
): Promise<string | null> {
  if (imageUrl.startsWith("data:")) return imageUrl;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return fetchImageAsDataUrl(imageUrl);
  }
  if (siteBase) {
    const base = siteBase.replace(/\/$/, "");
    return fetchImageAsDataUrl(`${base}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`);
  }
  return null;
}
