"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Move, X, ZoomIn } from "lucide-react";
import { cropImageToBlob } from "@/lib/crop-image";
import type { ImageAdjustPreset } from "@/lib/image-adjust-config";
import {
  DEFAULT_MEDIA_FOCUS,
  clampFocus,
  mediaFocusStyle,
  type MediaFocus,
} from "@/lib/media-focus";
import { useI18n } from "@/components/LocaleProvider";

interface Props {
  open: boolean;
  imageSrc: string;
  preset: ImageAdjustPreset;
  title: string;
  onClose: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
}

export default function ImageAdjustModal({
  open,
  imageSrc,
  preset,
  title,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useI18n();
  const [focus, setFocus] = useState<MediaFocus>(DEFAULT_MEDIA_FOCUS);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const dragRef = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setFocus(DEFAULT_MEDIA_FOCUS);
      setError("");
    }
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (exporting) return;
      const el = frameRef.current;
      if (!el) return;
      el.setPointerCapture(e.pointerId);
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        fx: focus.x,
        fy: focus.y,
      };
    },
    [exporting, focus.x, focus.y]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    const el = frameRef.current;
    if (!drag || !el) return;

    const rect = el.getBoundingClientRect();
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    const sens = 0.35;

    setFocus(
      clampFocus({
        x: drag.fx - (dx / rect.width) * 100 * sens,
        y: drag.fy - (dy / rect.height) * 100 * sens,
        zoom: focus.zoom,
      })
    );
  }, [focus.zoom]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    frameRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  const handleConfirm = async () => {
    setExporting(true);
    setError("");
    try {
      const blob = await cropImageToBlob(imageSrc, {
        aspect: preset.aspect,
        outputWidth: preset.outputWidth,
        outputHeight: preset.outputHeight,
        focus,
        circular: preset.circular,
        mime: preset.mime,
      });
      await onConfirm(blob);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("imageAdjust.exportError"));
    } finally {
      setExporting(false);
    }
  };

  if (!open) return null;

  const frameClass = preset.circular
    ? "aspect-square max-h-[min(52vh,360px)] w-full max-w-[min(52vh,360px)] mx-auto rounded-full"
    : preset.aspect >= 1
      ? "aspect-[16/9] w-full max-h-[42vh]"
      : "aspect-[9/16] w-full max-w-[220px] mx-auto max-h-[48vh]";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-adjust-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 id="image-adjust-title" className="text-sm font-medium text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={exporting}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            aria-label={t("imageAdjust.close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-xs text-white/45 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 shrink-0" />
            {t("imageAdjust.dragHint")}
          </p>

          <div
            ref={frameRef}
            className={`relative overflow-hidden border border-white/15 bg-black/40 touch-none cursor-grab active:cursor-grabbing ${frameClass}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <img
              src={imageSrc}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover select-none"
              style={mediaFocusStyle(focus)}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs text-white/50">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5" />
                {t("imageAdjust.zoom")}
              </span>
              <span className="text-white/70 tabular-nums">{focus.zoom.toFixed(1)}×</span>
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={focus.zoom}
              disabled={exporting}
              onChange={(e) =>
                setFocus((f) => clampFocus({ ...f, zoom: Number(e.target.value) }))
              }
              className="w-full accent-purple-500"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            disabled={exporting}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/70 hover:bg-white/5"
          >
            {t("imageAdjust.cancel")}
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={exporting}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("imageAdjust.saving")}
              </>
            ) : (
              t("imageAdjust.apply")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
