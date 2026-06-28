import type { Profile } from "@/types/profile";
import { getMediaSrc } from "@/lib/media/media-url";

/** Icono de pestaña: favicon subido → icono del nombre → avatar. */
export function resolveProfileTabIconUrl(
  profile: Pick<Profile, "avatarUrl" | "settings">
): string | undefined {
  const { settings, avatarUrl } = profile;
  const explicit = settings.browserTabIconUrl?.trim();
  if (explicit) return explicit;

  const profileIcon = settings.profileNameIconUrl?.trim();
  if (profileIcon) return profileIcon;

  const avatar = avatarUrl?.trim();
  if (avatar) return avatar;

  return undefined;
}

export function resolveProfileTabIconHref(
  iconUrl: string | undefined,
  siteUrl: string
): string | undefined {
  const trimmed = iconUrl?.trim();
  if (!trimmed) return undefined;

  const src = getMediaSrc(trimmed);
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return new URL(src, siteUrl).toString();
}

export function profileTabIconType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".webp")) return "image/webp";
  if (lower.includes(".gif")) return "image/gif";
  if (lower.includes(".svg")) return "image/svg+xml";
  if (lower.includes(".jpg") || lower.includes(".jpeg")) return "image/jpeg";
  return "image/png";
}
