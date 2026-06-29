import { readFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import sharp from "sharp";
import type { Profile } from "@/types/profile";
import { resolveBackgroundType } from "@/lib/media/media-config";
import { DEFAULT_MEDIA_FOCUS, type MediaFocus } from "@/lib/media/media-focus";
import { resolveOgImageSrc } from "@/lib/resolve-og-avatar";

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
const RASTER_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);

function localMediaPath(url: string): string | null {
  const pathname = url.split("?")[0]?.split("#")[0] ?? "";
  const match = /\/(?:api\/)?media\/([^/]+)\/([^/]+)$/i.exec(pathname);
  if (!match) return null;
  const [, userId, filename] = match;
  if (!userId || !filename || filename.includes("..")) return null;
  return path.join(UPLOAD_ROOT, userId, filename);
}

async function extractVideoFrame(filePath: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    const proc = spawn(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-ss",
        "0.5",
        "-i",
        filePath,
        "-vframes",
        "1",
        "-f",
        "image2pipe",
        "-vcodec",
        "png",
        "pipe:1",
      ],
      { stdio: ["ignore", "pipe", "ignore"] }
    );

    proc.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    proc.on("error", () => resolve(null));
    proc.on("close", (code) => resolve(code === 0 && chunks.length ? Buffer.concat(chunks) : null));
  });
}

async function loadRasterBuffer(filePath: string): Promise<Buffer | null> {
  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}

async function loadBackgroundBuffer(
  url: string,
  mediaType: "image" | "video" | "gif",
  siteUrl: string
): Promise<Buffer | null> {
  const localPath = localMediaPath(url);

  if (localPath) {
    const ext = path.extname(localPath).toLowerCase();
    if (VIDEO_EXT.has(ext) || mediaType === "video") {
      const frame = await extractVideoFrame(localPath);
      if (frame) return frame;
    }
    if (RASTER_EXT.has(ext) || mediaType === "gif" || mediaType === "image") {
      const buf = await loadRasterBuffer(localPath);
      if (buf) return buf;
    }
  }

  if (mediaType === "video") return null;

  const dataUrl = await resolveOgImageSrc(url, siteUrl);
  if (!dataUrl) return null;

  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;

  try {
    return Buffer.from(match[2], "base64");
  } catch {
    return null;
  }
}

function focalPosition(focus: MediaFocus): string {
  const x = Math.min(100, Math.max(0, focus.x));
  const y = Math.min(100, Math.max(0, focus.y));
  if (x < 35 && y < 35) return "left top";
  if (x > 65 && y < 35) return "right top";
  if (x < 35 && y > 65) return "left bottom";
  if (x > 65 && y > 65) return "right bottom";
  if (x < 35) return "left";
  if (x > 65) return "right";
  if (y < 35) return "top";
  if (y > 65) return "bottom";
  return "centre";
}

export async function renderBackgroundLayer(
  profile: Profile,
  siteUrl: string,
  width: number,
  height: number
): Promise<Buffer> {
  const { settings } = profile;
  const bgUrl = settings.backgroundUrl?.trim();
  const mediaType = resolveBackgroundType(bgUrl, profile.backgroundType);
  const focus = settings.backgroundFocus ?? DEFAULT_MEDIA_FOCUS;
  const dim = Math.min(1, Math.max(0, settings.backgroundDim ?? 0.35));

  let base: sharp.Sharp;

  if (bgUrl) {
    const raw = await loadBackgroundBuffer(bgUrl, mediaType, siteUrl);
    if (raw) {
      const zoom = Math.max(0.5, Math.min(3, focus.zoom));
      let pipeline = sharp(raw).rotate();

      if (zoom !== 1) {
        const meta = await pipeline.metadata();
        const w = meta.width ?? width;
        const h = meta.height ?? height;
        const cropW = Math.max(1, Math.round(w / zoom));
        const cropH = Math.max(1, Math.round(h / zoom));
        const left = Math.max(0, Math.min(w - cropW, Math.round((w - cropW) * (focus.x / 100))));
        const top = Math.max(0, Math.min(h - cropH, Math.round((h - cropH) * (focus.y / 100))));
        pipeline = sharp(raw).extract({ left, top, width: cropW, height: cropH });
      }

      base = pipeline.resize(width, height, {
        fit: "cover",
        position: focalPosition(focus),
      });
    } else {
      base = sharp({
        create: {
          width,
          height,
          channels: 3,
          background: { r: 10, g: 10, b: 15 },
        },
      });
    }
  } else {
    const accent = settings.accentColor ?? "#a855f7";
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="50%" stop-color="#12081f"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
</svg>`;
    base = sharp(Buffer.from(svg));
  }

  const overlayOpacity = 0.25 + dim * 0.55;
  const overlay = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="v" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="${overlayOpacity * 0.7}"/>
      <stop offset="55%" stop-color="#000000" stop-opacity="${overlayOpacity * 0.35}"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="${overlayOpacity}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#v)"/>
</svg>`);

  return base
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
}
