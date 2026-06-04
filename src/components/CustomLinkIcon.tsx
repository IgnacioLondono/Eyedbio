"use client";

import type { CSSProperties } from "react";
import { getMediaSrc } from "@/lib/media-url";

interface Props {
  iconUrl: string;
  color: string;
  sizeClass: string;
  glowIcons?: boolean;
  /** Si false, muestra la imagen en color (p. ej. vista previa en el editor). */
  themed?: boolean;
}

/**
 * Icono de enlace personalizado: plantilla enmascarada con el color del perfil.
 */
export default function CustomLinkIcon({
  iconUrl,
  color,
  sizeClass,
  glowIcons = false,
  themed = true,
}: Props) {
  const src = getMediaSrc(iconUrl);

  if (!themed) {
    return (
      <img
        src={src}
        alt=""
        className={`${sizeClass} max-w-full max-h-full object-contain pointer-events-none`}
        draggable={false}
      />
    );
  }

  const maskLayerStyle: CSSProperties = {
    backgroundColor: color,
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    filter: glowIcons ? `drop-shadow(0 0 6px ${color})` : undefined,
  };

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${sizeClass}`}
      role="img"
      aria-hidden
    >
      <span className="absolute inset-0" style={maskLayerStyle} />
    </span>
  );
}
