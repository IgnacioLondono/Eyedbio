export interface MediaFocus {
  /** Punto focal horizontal 0–100 */
  x: number;
  /** Punto focal vertical 0–100 */
  y: number;
  /** Zoom ≥ 1 (recorte más cerrado) */
  zoom: number;
}

export const DEFAULT_MEDIA_FOCUS: MediaFocus = { x: 50, y: 50, zoom: 1 };

export type ClampFocusOptions = {
  minZoom?: number;
  maxZoom?: number;
};

export function clampFocus(
  focus: MediaFocus,
  options: ClampFocusOptions = {}
): MediaFocus {
  const minZoom = options.minZoom ?? 1;
  const maxZoom = options.maxZoom ?? 3;
  return {
    x: Math.min(100, Math.max(0, focus.x)),
    y: Math.min(100, Math.max(0, focus.y)),
    zoom: Math.min(maxZoom, Math.max(minZoom, focus.zoom)),
  };
}

export function parseMediaFocus(
  value: unknown,
  options?: ClampFocusOptions
): MediaFocus {
  if (!value || typeof value !== "object") return { ...DEFAULT_MEDIA_FOCUS };
  const v = value as Partial<MediaFocus>;
  return clampFocus(
    {
      x: typeof v.x === "number" ? v.x : DEFAULT_MEDIA_FOCUS.x,
      y: typeof v.y === "number" ? v.y : DEFAULT_MEDIA_FOCUS.y,
      zoom: typeof v.zoom === "number" ? v.zoom : DEFAULT_MEDIA_FOCUS.zoom,
    },
    options
  );
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
