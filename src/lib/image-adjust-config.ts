import type { UploadKind } from "@/lib/media-config";

export interface ImageAdjustPreset {
  aspect: number;
  outputWidth: number;
  outputHeight: number;
  circular?: boolean;
  mime: "image/jpeg" | "image/png" | "image/webp";
}

export const IMAGE_ADJUST_PRESETS: Partial<Record<UploadKind, ImageAdjustPreset>> = {
  avatar: {
    aspect: 1,
    outputWidth: 512,
    outputHeight: 512,
    circular: true,
    mime: "image/jpeg",
  },
  banner: {
    aspect: 1280 / 400,
    outputWidth: 1280,
    outputHeight: 400,
    mime: "image/jpeg",
  },
  background: {
    aspect: 9 / 16,
    outputWidth: 1080,
    outputHeight: 1920,
    mime: "image/jpeg",
  },
};

export function isAdjustableUploadKind(kind: UploadKind): boolean {
  return kind === "avatar" || kind === "banner" || kind === "background";
}

export function isAdjustableImageFile(file: File, kind?: UploadKind): boolean {
  if (!file.type.startsWith("image/")) return false;
  if (file.type === "image/svg+xml") return false;
  if (kind === "background" && file.type === "image/gif") return false;
  return true;
}

export function isAdjustableImageUrl(url: string, kind?: UploadKind): boolean {
  if (!url?.trim()) return false;
  if (/\.svg(\?|$)/i.test(url) || url.includes("dicebear.com")) return false;
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return false;
  if (kind === "background" && /\.gif(\?|$)/i.test(url)) return false;
  return /\.(jpe?g|png|webp|gif|avif|bmp)(\?|$)/i.test(url) || url.startsWith("/");
}
