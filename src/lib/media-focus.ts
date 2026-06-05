export interface MediaFocus {
  /** Punto focal horizontal 0–100 */
  x: number;
  /** Punto focal vertical 0–100 */
  y: number;
  /** Zoom ≥ 1 (recorte más cerrado) */
  zoom: number;
}

export const DEFAULT_MEDIA_FOCUS: MediaFocus = { x: 50, y: 50, zoom: 1 };

export function clampFocus(focus: MediaFocus): MediaFocus {
  return {
    x: Math.min(100, Math.max(0, focus.x)),
    y: Math.min(100, Math.max(0, focus.y)),
    zoom: Math.min(3, Math.max(1, focus.zoom)),
  };
}

/** Calcula el rectángulo de recorte en píxeles de la imagen original. */
export function getCropAreaFromFocus(
  imgWidth: number,
  imgHeight: number,
  aspect: number,
  focus: MediaFocus
): { x: number; y: number; width: number; height: number } {
  const { x: fx, y: fy, zoom } = clampFocus(focus);

  let cropH = imgHeight / zoom;
  let cropW = cropH * aspect;

  if (cropW > imgWidth / zoom) {
    cropW = imgWidth / zoom;
    cropH = cropW / aspect;
  }

  const maxX = Math.max(0, imgWidth - cropW);
  const maxY = Math.max(0, imgHeight - cropH);
  const x = (fx / 100) * maxX;
  const y = (fy / 100) * maxY;

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(cropW),
    height: Math.round(cropH),
  };
}

export function mediaFocusStyle(focus: MediaFocus): {
  objectPosition: string;
  transform: string;
  transformOrigin: string;
} {
  const { x, y, zoom } = clampFocus(focus);
  return {
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${x}% ${y}%`,
  };
}
