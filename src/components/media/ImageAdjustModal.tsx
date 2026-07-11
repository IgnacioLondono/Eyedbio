"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Eraser,
  Grid3x3,
  Loader2,
  RotateCcw,
  Scan,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { ImageAdjustPreset } from "@/lib/config/image-adjust-config";
import {
  DEFAULT_MEDIA_FOCUS,
  clampFocus,
  mediaFocusPositionStyle,
  type MediaFocus,
} from "@/lib/media/media-focus";
import { useI18n } from "@/components/providers/LocaleProvider";

export interface ImageAdjustResult {
  focus: MediaFocus;
  /** PNG sin fondo, si el usuario usó la opción opcional. */
  processedFile?: File;
}

interface Props {
  open: boolean;
  imageSrc: string;
  mediaKind?: "image" | "video";
  preset: ImageAdjustPreset;
  title: string;
  initialFocus?: MediaFocus;
  /** Nombre base para el archivo procesado (p. ej. avatar.png). */
  fileName?: string;
  onClose: () => void;
  onConfirm: (result: ImageAdjustResult) => void | Promise<void>;
}

const CHECKERBOARD =
  "linear-gradient(45deg, #2a2a35 25%, transparent 25%), linear-gradient(-45deg, #2a2a35 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a35 75%), linear-gradient(-45deg, transparent 75%, #2a2a35 75%)";

function CropGuides({
  circular,
  showGrid,
  dragging,
}: {
  circular: boolean;
  showGrid: boolean;
  dragging: boolean;
}) {
  const visible = showGrid || dragging;
  if (!visible) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-150 ${
        dragging ? "opacity-100" : "opacity-70"
      }`}
      aria-hidden
    >
      {/* Rule of thirds */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, transparent calc(33.333% - 0.5px), rgba(255,255,255,0.45) calc(33.333% - 0.5px), rgba(255,255,255,0.45) calc(33.333% + 0.5px), transparent calc(33.333% + 0.5px)),
            linear-gradient(to right, transparent calc(66.666% - 0.5px), rgba(255,255,255,0.45) calc(66.666% - 0.5px), rgba(255,255,255,0.45) calc(66.666% + 0.5px), transparent calc(66.666% + 0.5px)),
            linear-gradient(to bottom, transparent calc(33.333% - 0.5px), rgba(255,255,255,0.45) calc(33.333% - 0.5px), rgba(255,255,255,0.45) calc(33.333% + 0.5px), transparent calc(33.333% + 0.5px)),
            linear-gradient(to bottom, transparent calc(66.666% - 0.5px), rgba(255,255,255,0.45) calc(66.666% - 0.5px), rgba(255,255,255,0.45) calc(66.666% + 0.5px), transparent calc(66.666% + 0.5px))
          `,
        }}
      />
      {/* Center crosshair */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/25" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />
      <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-purple-400/40 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]" />

      {/* Corner brackets */}
      {!circular ? (
        <>
          <span className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-white/80" />
          <span className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-white/80" />
          <span className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-white/80" />
          <span className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-white/80" />
        </>
      ) : (
        <div className="absolute inset-[10%] rounded-full border border-dashed border-white/30" />
      )}
    </div>
  );
}

export default function ImageAdjustModal({
  open,
  imageSrc,
  mediaKind = "image",
  preset,
  title,
  initialFocus,
  fileName = "image.png",
  onClose,
  onConfirm,
}: Props) {
  const { t } = useI18n();
  const minZoom = preset.minZoom ?? 0.5;
  const maxZoom = preset.maxZoom ?? 3;
  const isBannerStrip = !preset.circular && preset.aspect >= 2.5;
  const canRemoveBackground = mediaKind === "image";

  const [focus, setFocus] = useState<MediaFocus>(DEFAULT_MEDIA_FOCUS);
  const [exporting, setExporting] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [error, setError] = useState("");
  const [previewSrc, setPreviewSrc] = useState(imageSrc);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const processedUrlRef = useRef<string | null>(null);
  const focusRef = useRef(focus);

  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  const revokeProcessedUrl = useCallback(() => {
    if (processedUrlRef.current) {
      URL.revokeObjectURL(processedUrlRef.current);
      processedUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (open) {
      setFocus(clampFocus(initialFocus ?? DEFAULT_MEDIA_FOCUS, { minZoom, maxZoom }));
      setError("");
      setProcessedBlob(null);
      revokeProcessedUrl();
      setPreviewSrc(imageSrc);
      setDragging(false);
      setShowGrid(true);
    }
  }, [open, imageSrc, initialFocus, minZoom, maxZoom, revokeProcessedUrl]);

  useEffect(() => () => revokeProcessedUrl(), [revokeProcessedUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !removingBg && !exporting) {
        onClose();
        return;
      }
      if (removingBg || exporting) return;

      const step = e.shiftKey ? 5 : 1.5;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFocus((f) => clampFocus({ ...f, x: f.x - step }, { minZoom, maxZoom }));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setFocus((f) => clampFocus({ ...f, x: f.x + step }, { minZoom, maxZoom }));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocus((f) => clampFocus({ ...f, y: f.y - step }, { minZoom, maxZoom }));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocus((f) => clampFocus({ ...f, y: f.y + step }, { minZoom, maxZoom }));
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setFocus((f) => clampFocus({ ...f, zoom: f.zoom + 0.1 }, { minZoom, maxZoom }));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setFocus((f) => clampFocus({ ...f, zoom: f.zoom - 0.1 }, { minZoom, maxZoom }));
      } else if (e.key.toLowerCase() === "g") {
        e.preventDefault();
        setShowGrid((v) => !v);
      } else if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        setFocus((f) => clampFocus({ ...f, x: 50, y: 50 }, { minZoom, maxZoom }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, removingBg, exporting, minZoom, maxZoom]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (exporting || removingBg) return;
      const el = frameRef.current;
      if (!el) return;
      el.setPointerCapture(e.pointerId);
      setDragging(true);
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        fx: focus.x,
        fy: focus.y,
      };
    },
    [exporting, removingBg, focus.x, focus.y]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      const el = frameRef.current;
      if (!drag || !el) return;

      const rect = el.getBoundingClientRect();
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      // Más zoom → arrastre más fino; menos zoom → más recorrido
      const zoom = focusRef.current.zoom || 1;
      const sens = 0.55 / Math.max(zoom, 0.5);

      setFocus((f) =>
        clampFocus(
          {
            x: drag.fx - (dx / rect.width) * 100 * sens,
            y: drag.fy - (dy / rect.height) * 100 * sens,
            zoom: f.zoom,
          },
          { minZoom, maxZoom }
        )
      );
    },
    [minZoom, maxZoom]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    setDragging(false);
    frameRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  const onDoubleClick = useCallback(() => {
    if (exporting || removingBg) return;
    setFocus((f) => clampFocus({ ...f, x: 50, y: 50 }, { minZoom, maxZoom }));
  }, [exporting, removingBg, minZoom, maxZoom]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (exporting || removingBg) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setFocus((f) => clampFocus({ ...f, zoom: f.zoom + delta }, { minZoom, maxZoom }));
    },
    [exporting, removingBg, minZoom, maxZoom]
  );

  const nudgeZoom = (delta: number) => {
    setFocus((f) => clampFocus({ ...f, zoom: f.zoom + delta }, { minZoom, maxZoom }));
  };

  const handleRemoveBackground = async () => {
    if (!canRemoveBackground || removingBg) return;
    setRemovingBg(true);
    setError("");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(previewSrc);
      revokeProcessedUrl();
      const url = URL.createObjectURL(blob);
      processedUrlRef.current = url;
      setProcessedBlob(blob);
      setPreviewSrc(url);
    } catch {
      setError(t("imageAdjust.removeBgError"));
    } finally {
      setRemovingBg(false);
    }
  };

  const handleRestoreOriginal = () => {
    revokeProcessedUrl();
    setProcessedBlob(null);
    setPreviewSrc(imageSrc);
    setError("");
  };

  const handleConfirm = async () => {
    setExporting(true);
    setError("");
    const savedFocus = clampFocus(focus, { minZoom, maxZoom });

    try {
      let processedFile: File | undefined;
      if (processedBlob) {
        const base = fileName.replace(/\.[^.]+$/, "") || "image";
        processedFile = new File([processedBlob], `${base}-nobg.png`, {
          type: "image/png",
        });
      }
      await onConfirm({ focus: savedFocus, processedFile });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("imageAdjust.exportError"));
    } finally {
      setExporting(false);
    }
  };

  if (!open) return null;

  const isVideo = mediaKind === "video";
  const focusStyle = mediaFocusPositionStyle(focus, { minZoom, maxZoom });
  const busy = exporting || removingBg;
  const hasRemovedBg = Boolean(processedBlob);
  const zoomPercent = Math.round(focus.zoom * 100);

  const frameStyle: CSSProperties = preset.circular
    ? {}
    : {
        aspectRatio: preset.aspect,
        width: "100%",
        maxHeight: isBannerStrip ? "min(22vh, 140px)" : "min(32vh, 240px)",
      };

  const frameClass = preset.circular
    ? "aspect-square max-h-[min(34vh,240px)] w-full max-w-[min(34vh,240px)] mx-auto rounded-full"
    : "w-full mx-auto rounded-xl";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-adjust-title"
    >
      <div className="flex w-full max-w-lg max-h-[calc(100dvh-1.5rem)] flex-col rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-3 px-3 py-2 border-b border-white/10">
          <div className="min-w-0">
            <h2 id="image-adjust-title" className="text-sm font-medium text-white truncate">
              {title}
            </h2>
            <p className="mt-0.5 text-[10px] text-white/40 truncate">
              {isBannerStrip ? t("imageAdjust.bannerFocusHint") : t("imageAdjust.cropToolsHint")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 shrink-0"
            aria-label={t("imageAdjust.close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2.5">
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowGrid((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors ${
                showGrid
                  ? "border-purple-500/40 bg-purple-500/15 text-purple-200"
                  : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white"
              }`}
              title={t("imageAdjust.toggleGrid")}
            >
              <Grid3x3 className="h-3.5 w-3.5" />
              {t("imageAdjust.grid")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                setFocus((f) => clampFocus({ ...f, x: 50, y: 50 }, { minZoom, maxZoom }))
              }
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-white/55 transition-colors hover:text-white"
              title={t("imageAdjust.centerFocus")}
            >
              <Scan className="h-3.5 w-3.5" />
              {t("imageAdjust.center")}
            </button>
          </div>

          <div
            ref={frameRef}
            className={`relative overflow-hidden border border-white/20 touch-none cursor-grab active:cursor-grabbing shadow-[inset_0_0_0_1px_rgba(168,85,247,0.15)] ${frameClass} ${
              dragging ? "ring-2 ring-purple-400/50" : ""
            }`}
            style={{
              ...frameStyle,
              backgroundColor: hasRemovedBg ? "#1a1a24" : "rgba(0,0,0,0.45)",
              backgroundImage: hasRemovedBg ? CHECKERBOARD : undefined,
              backgroundSize: hasRemovedBg ? "16px 16px" : undefined,
              backgroundPosition: hasRemovedBg ? "0 0, 0 8px, 8px -8px, -8px 0" : undefined,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={onDoubleClick}
            onWheel={onWheel}
          >
            {isVideo ? (
              <video
                src={previewSrc}
                muted
                loop
                autoPlay
                playsInline
                draggable={false}
                className="select-none"
                style={focusStyle}
              />
            ) : (
              <img
                src={previewSrc}
                alt=""
                draggable={false}
                className="select-none"
                style={focusStyle}
              />
            )}

            <CropGuides
              circular={Boolean(preset.circular)}
              showGrid={showGrid}
              dragging={dragging}
            />

            <div
              className="pointer-events-none absolute inset-0 z-[9] rounded-[inherit]"
              style={{
                boxShadow: preset.circular
                  ? "inset 0 0 0 999px rgba(0,0,0,0.08)"
                  : "inset 0 0 40px rgba(0,0,0,0.25)",
              }}
              aria-hidden
            />

            {removingBg ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1.5 bg-black/55 backdrop-blur-[2px]">
                <Loader2 className="h-5 w-5 animate-spin text-purple-300" />
                <p className="px-3 text-center text-[11px] text-white/70">
                  {t("imageAdjust.removeBgWorking")}
                </p>
              </div>
            ) : null}

            {isBannerStrip ? (
              <div className="pointer-events-none absolute top-1.5 left-1.5 z-20 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-purple-200/90">
                {t("imageAdjust.bannerVisibleArea")}
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1 text-xs text-white/50">
                <ZoomIn className="w-3.5 h-3.5" />
                {t("imageAdjust.zoom")}
                <span className="ml-1 tabular-nums text-white/35">{zoomPercent}%</span>
              </label>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  disabled={busy || focus.zoom <= minZoom}
                  onClick={() => nudgeZoom(-0.1)}
                  className="rounded-md p-1 text-white/45 hover:bg-white/5 hover:text-white disabled:opacity-30"
                  aria-label={t("imageAdjust.zoomOut")}
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={busy || focus.zoom >= maxZoom}
                  onClick={() => nudgeZoom(0.1)}
                  className="rounded-md p-1 text-white/45 hover:bg-white/5 hover:text-white disabled:opacity-30"
                  aria-label={t("imageAdjust.zoomIn")}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setFocus({ ...DEFAULT_MEDIA_FOCUS })}
                  className="ml-0.5 flex items-center gap-1 text-[11px] text-white/45 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t("imageAdjust.reset")}
                </button>
              </div>
            </div>
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={0.05}
              value={focus.zoom}
              disabled={busy}
              onChange={(e) =>
                setFocus((f) =>
                  clampFocus({ ...f, zoom: Number(e.target.value) }, { minZoom, maxZoom })
                )
              }
              className="w-full accent-purple-500"
            />
          </div>

          {canRemoveBackground ? (
            <div className="flex items-center gap-2">
              {!hasRemovedBg ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleRemoveBackground()}
                  title={t("imageAdjust.removeBgHint")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  {t("imageAdjust.removeBg")}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleRestoreOriginal}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("imageAdjust.restoreBg")}
                </button>
              )}
              <p className="min-w-0 flex-1 truncate text-[10px] text-white/35">
                {t("imageAdjust.removeBgHint")}
              </p>
            </div>
          ) : null}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex shrink-0 gap-2 px-3 py-2.5 border-t border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 py-2 rounded-xl border border-white/10 text-sm text-white/70 hover:bg-white/5"
          >
            {t("imageAdjust.cancel")}
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={busy}
            className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("imageAdjust.saving")}
              </>
            ) : (
              t("imageAdjust.applyFocus")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
