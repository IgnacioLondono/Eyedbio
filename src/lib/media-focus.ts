export interface MediaFocus {
  /** Punto focal horizontal 0–100 */
  x: number;
  /** Punto focal vertical 0–100 */
  y: number;
  /** 0.5 = alejar (ver más) · 1 = normal · 3 = acercar */
  zoom: number;
}

export const DEFAULT_MEDIA_FOCUS: MediaFocus = { x: 50, y: 50, zoom: 1 };

export const MEDIA_FOCUS_ZOOM = { min: 0.5, max: 3 } as const;

export type ClampFocusOptions = {
  minZoom?: number;
  maxZoom?: number;
};

export function clampFocus(
  focus: MediaFocus,
  options: ClampFocusOptions = {}
): MediaFocus {
  const minZoom = options.minZoom ?? MEDIA_FOCUS_ZOOM.min;
  const maxZoom = options.maxZoom ?? MEDIA_FOCUS_ZOOM.max;
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

/** Estilo para img/video dentro de un contenedor `relative overflow-hidden`. */
export function mediaFocusPositionStyle(
  focus: MediaFocus,
  options?: ClampFocusOptions
): {
  position: "absolute";
  left: string;
  top: string;
  transform: string;
  minWidth: string;
  minHeight: string;
  width: string;
  height: string;
  maxWidth: string;
} {
  const { x, y, zoom } = clampFocus(focus, options);
  return {
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) scale(${zoom})`,
    minWidth: "100%",
    minHeight: "100%",
    width: "auto",
    height: "auto",
    maxWidth: "none",
  };
}

/** @deprecated Usa mediaFocusPositionStyle dentro de un contenedor overflow-hidden */
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
