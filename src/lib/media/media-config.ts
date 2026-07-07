import type { BackgroundType } from "@/types/profile";

export type UploadKind =
  | "avatar"
  | "background"
  | "banner"
  | "audio"
  | "linkIcon"
  | "favicon"
  | "profileIcon"
  | "cursor"
  | "musicCover";

export const UPLOAD_LIMITS: Record<UploadKind, number> = {
  avatar: 5 * 1024 * 1024,
  background: 80 * 1024 * 1024,
  banner: 10 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  linkIcon: 2 * 1024 * 1024,
  favicon: 1 * 1024 * 1024,
  profileIcon: 2 * 1024 * 1024,
  cursor: 1 * 1024 * 1024,
  musicCover: 5 * 1024 * 1024,
};

export const AUDIO_MIMES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/x-aac",
  "audio/flac",
  "audio/x-flac",
  "audio/opus",
  "audio/aiff",
  "audio/x-aiff",
  "audio/midi",
  "audio/x-midi",
  "application/ogg",
] as const;

export const AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".ogg",
  ".webm",
  ".m4a",
  ".aac",
  ".flac",
  ".opus",
  ".aiff",
  ".aif",
  ".weba",
  ".mid",
  ".midi",
] as const;

export const BACKGROUND_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/bmp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const BACKGROUND_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".bmp",
  ".mp4",
  ".webm",
  ".mov",
] as const;

export const AVATAR_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/bmp",
] as const;

export const AVATAR_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp"] as const;

/** Cursores: solo formatos que el navegador acepta como cursor (sin GIF animado). */
export const CURSOR_MIMES = ["image/png", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"] as const;

export const CURSOR_EXTENSIONS = [".png", ".webp", ".cur", ".ico"] as const;

export const ALLOWED_MIMES: Record<UploadKind, readonly string[]> = {
  avatar: AVATAR_MIMES,
  background: BACKGROUND_MIMES,
  banner: AVATAR_MIMES,
  audio: AUDIO_MIMES,
  linkIcon: AVATAR_MIMES,
  favicon: AVATAR_MIMES,
  profileIcon: AVATAR_MIMES,
  cursor: CURSOR_MIMES,
  musicCover: AVATAR_MIMES,
};

export const ALLOWED_EXTENSIONS: Record<UploadKind, readonly string[]> = {
  avatar: AVATAR_EXTENSIONS,
  background: BACKGROUND_EXTENSIONS,
  banner: AVATAR_EXTENSIONS,
  audio: AUDIO_EXTENSIONS,
  linkIcon: AVATAR_EXTENSIONS,
  favicon: AVATAR_EXTENSIONS,
  profileIcon: AVATAR_EXTENSIONS,
  cursor: CURSOR_EXTENSIONS,
  musicCover: AVATAR_EXTENSIONS,
};

export const ACCEPT_ATTR: Record<UploadKind, string> = {
  avatar: AVATAR_MIMES.join(","),
  background: [...BACKGROUND_MIMES, ...BACKGROUND_EXTENSIONS].join(","),
  banner: [...AVATAR_MIMES, ...AVATAR_EXTENSIONS].join(","),
  audio: [...AUDIO_MIMES, ...AUDIO_EXTENSIONS].join(","),
  linkIcon: [...AVATAR_MIMES, ...AVATAR_EXTENSIONS].join(","),
  favicon: [...AVATAR_MIMES, ...AVATAR_EXTENSIONS].join(","),
  profileIcon: [...AVATAR_MIMES, ...AVATAR_EXTENSIONS].join(","),
  cursor: [...CURSOR_MIMES, ...CURSOR_EXTENSIONS].join(","),
  musicCover: [...AVATAR_MIMES, ...AVATAR_EXTENSIONS].join(","),
};

export const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".flac": "audio/flac",
  ".opus": "audio/opus",
  ".aiff": "audio/aiff",
  ".aif": "audio/aiff",
  ".weba": "audio/webm",
  ".mid": "audio/midi",
  ".midi": "audio/midi",
};

export const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/bmp": ".bmp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/wave": ".wav",
  "audio/ogg": ".ogg",
  "application/ogg": ".ogg",
  "audio/webm": ".webm",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/aac": ".aac",
  "audio/x-aac": ".aac",
  "audio/flac": ".flac",
  "audio/x-flac": ".flac",
  "audio/opus": ".opus",
  "audio/aiff": ".aiff",
  "audio/x-aiff": ".aif",
  "audio/midi": ".mid",
  "audio/x-midi": ".mid",
};

export function getMediaPublicPrefix() {
  return process.env.PUBLIC_MEDIA_PREFIX ?? "/api/media";
}

export function buildMediaUrl(userId: string, filename: string) {
  return `${getMediaPublicPrefix()}/${userId}/${filename}`;
}

export function getUploadLimitMb(kind: UploadKind): number {
  return Math.round(UPLOAD_LIMITS[kind] / 1024 / 1024);
}

export type UploadValidationError =
  | { code: "type" }
  | { code: "size"; limitMb: number };

export function getUploadValidationError(
  kind: UploadKind,
  file: Pick<File, "name" | "type" | "size">
): UploadValidationError | null {
  if (!isUploadAllowed(kind, file)) return { code: "type" };
  const limit = UPLOAD_LIMITS[kind];
  if (file.size > limit) {
    return { code: "size", limitMb: getUploadLimitMb(kind) };
  }
  return null;
}

export function isUploadAllowed(kind: UploadKind, file: Pick<File, "name" | "type">) {
  const ext = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    : "";

  if (file.type && ALLOWED_MIMES[kind].includes(file.type)) return true;
  if (ext && ALLOWED_EXTENSIONS[kind].includes(ext)) return true;

  return false;
}

export function detectBackgroundTypeFromUrl(url: string): BackgroundType {
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return "video";
  if (/\.gif(\?|$)/i.test(url)) return "gif";
  return "image";
}

/** Usa la extensión del URL cuando existe; evita tipos obsoletos (p. ej. video + imagen). */
export function resolveBackgroundType(
  url: string,
  storedType?: BackgroundType
): BackgroundType {
  if (!url?.trim()) return storedType ?? "image";

  const fromUrl = detectBackgroundTypeFromUrl(url);
  const hasExtension = /\.(mp4|webm|mov|gif|jpe?g|png|webp|avif|bmp)(\?|$)/i.test(url);

  if (hasExtension) return fromUrl;

  // Sin extensión en la URL: confiar en lo guardado en BD (p. ej. background-1234567890 sin .mp4).
  if (storedType === "video" || storedType === "gif") return storedType;

  return storedType ?? fromUrl;
}
