import type { UploadKind } from "@/lib/media/media-config";
import { MEDIA_FOCUS_ZOOM } from "@/lib/media/media-focus";

export interface ImageAdjustPreset {
  /** Relación del marco de vista previa (solo UI) */
  aspect: number;
  circular?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

export const IMAGE_ADJUST_PRESETS: Partial<Record<UploadKind, ImageAdjustPreset>> = {
  avatar: {
    aspect: 1,
    circular: true,
    minZoom: MEDIA_FOCUS_ZOOM.min,
    maxZoom: MEDIA_FOCUS_ZOOM.max,
  },
  banner: {
    aspect: 1280 / 400,
    minZoom: MEDIA_FOCUS_ZOOM.min,
    maxZoom: MEDIA_FOCUS_ZOOM.max,
  },
  background: {
    aspect: 16 / 9,
    minZoom: MEDIA_FOCUS_ZOOM.min,
    maxZoom: MEDIA_FOCUS_ZOOM.max,
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
