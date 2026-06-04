"use client";

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
    return <img src={src} alt="" className={`${sizeClass} object-contain`} />;
  }

  return (
    <span
      className={`inline-block shrink-0 ${sizeClass}`}
      style={{
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
      }}
      role="img"
      aria-hidden
    />
  );
}
