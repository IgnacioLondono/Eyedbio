"use client";

import { getMediaSrc } from "@/lib/media/media-url";

interface Props {
  iconUrl: string;
  color: string;
  sizeClass: string;
  glowIcons?: boolean;
}

export default function CustomLinkIcon({
  iconUrl,
  color,
  sizeClass,
  glowIcons = false,
}: Props) {
  const src = getMediaSrc(iconUrl);

  return (
    <img
      src={src}
      alt=""
      className={`${sizeClass} max-w-full max-h-full object-contain pointer-events-none`}
      style={glowIcons ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
      draggable={false}
    />
  );
}
