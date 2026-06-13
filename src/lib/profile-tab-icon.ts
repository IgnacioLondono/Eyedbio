import { getMediaSrc } from "@/lib/media-url";

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
