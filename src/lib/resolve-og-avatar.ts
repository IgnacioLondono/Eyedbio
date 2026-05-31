import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

const RASTER_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

/** Convierte avatar a una fuente compatible con next/og (sin SVG). */
export async function resolveOgAvatarSrc(
  avatarUrl: string | undefined | null,
  siteBase: string
): Promise<string | null> {
  if (!avatarUrl?.trim()) return null;

  const normalized = avatarUrl.trim();

  if (normalized.includes("dicebear.com") && normalized.includes("/svg")) {
    return normalized.replace("/svg", "/png");
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
      return `${base}${publicPath}`;
    }
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  const base = siteBase.replace(/\/$/, "");
  return `${base}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}
