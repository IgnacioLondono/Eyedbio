import type { UploadKind } from "@/lib/media-config";

export type ImageAdjustMode = "crop" | "focus";

export interface ImageAdjustPreset {
  mode: ImageAdjustMode;
  /** Relación del marco de vista previa (solo UI) */
  aspect: number;
  outputWidth?: number;
  outputHeight?: number;
  circular?: boolean;
  mime?: "image/jpeg" | "image/png" | "image/webp";
  minZoom?: number;
  maxZoom?: number;
}

export const IMAGE_ADJUST_PRESETS: Partial<Record<UploadKind, ImageAdjustPreset>> = {
  avatar: {
    mode: "crop",
    aspect: 1,
    outputWidth: 512,
    outputHeight: 512,
    circular: true,
    mime: "image/jpeg",
    minZoom: 1,
    maxZoom: 3,
  },
  banner: {
    mode: "crop",
    aspect: 1280 / 400,
    outputWidth: 1280,
    outputHeight: 400,
    mime: "image/jpeg",
    minZoom: 1,
    maxZoom: 3,
  },
  background: {
    mode: "focus",
    aspect: 16 / 9,
    minZoom: 0.5,
    maxZoom: 2,
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
