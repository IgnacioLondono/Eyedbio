import type { BackgroundType } from "@/types/profile";

export type UploadKind = "avatar" | "background" | "audio" | "linkIcon";

export const UPLOAD_LIMITS: Record<UploadKind, number> = {
  avatar: 5 * 1024 * 1024,
  background: 50 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  linkIcon: 2 * 1024 * 1024,
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

export const ALLOWED_MIMES: Record<UploadKind, readonly string[]> = {
  avatar: AVATAR_MIMES,
  background: BACKGROUND_MIMES,
  audio: AUDIO_MIMES,
  linkIcon: AVATAR_MIMES,
};

export const ALLOWED_EXTENSIONS: Record<UploadKind, readonly string[]> = {
  avatar: AVATAR_EXTENSIONS,
  background: BACKGROUND_EXTENSIONS,
  audio: AUDIO_EXTENSIONS,
  linkIcon: AVATAR_EXTENSIONS,
};

export const ACCEPT_ATTR: Record<UploadKind, string> = {
  avatar: AVATAR_MIMES.join(","),
  background: [...BACKGROUND_MIMES, ...BACKGROUND_EXTENSIONS].join(","),
  audio: [...AUDIO_MIMES, ...AUDIO_EXTENSIONS].join(","),
  linkIcon: [...AVATAR_MIMES, ...AVATAR_EXTENSIONS].join(","),
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
  if (storedType === "video" && fromUrl === "image") return "image";

  return storedType ?? fromUrl;
}
