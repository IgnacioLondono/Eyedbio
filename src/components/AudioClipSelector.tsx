"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import {
  AUDIO_CLIP_DURATION,
  clampAudioStart,
  formatAudioTime,
} from "@/lib/audio-config";
import { getMediaSrc } from "@/lib/media-url";

interface Props {
  audioUrl: string;
  startTime: number;
  onChange: (startTime: number) => void;
}

export default function AudioClipSelector({ audioUrl, startTime, onChange }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef(0);
  const onChangeRef = useRef(onChange);
  const startTimeRef = useRef(startTime);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [dragging, setDragging] = useState(false);

  onChangeRef.current = onChange;
  startTimeRef.current = startTime;

  const src = getMediaSrc(audioUrl);
  const clipEnd = startTime + AUDIO_CLIP_DURATION;
  const needsSelection = duration > AUDIO_CLIP_DURATION;
  const clipWidthPercent =
    duration > 0 ? Math.min((AUDIO_CLIP_DURATION / duration) * 100, 100) : 100;
  const clipLeftPercent = duration > 0 ? (startTime / duration) * 100 : 0;

  useEffect(() => {
    setLoading(true);
    setDuration(0);
    setPreviewing(false);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      const nextDuration = audio.duration;
      if (!Number.isFinite(nextDuration)) return;
      setDuration(nextDuration);
      const clamped = clampAudioStart(startTimeRef.current, nextDuration);
      if (clamped !== startTimeRef.current) {
        onChangeRef.current(clamped);
      }
      setLoading(false);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    return () => audio.removeEventListener("loadedmetadata", onLoaded);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!previewing) return;
      if (audio.currentTime >= clipEnd) {
        audio.pause();
        setPreviewing(false);
      }
    };

    const onEnded = () => setPreviewing(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [clipEnd, previewing]);

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || duration <= 0) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const beginDrag = (clientX: number) => {
    if (!needsSelection) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const clipLeftPx = rect.left + (clipLeftPercent / 100) * rect.width;
    dragOffsetRef.current = clientX - clipLeftPx;
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      const track = trackRef.current;
      if (!track || duration <= 0) return;
      const rect = track.getBoundingClientRect();
      const clipWidthPx = (clipWidthPercent / 100) * rect.width;
      const leftPx = event.clientX - dragOffsetRef.current - rect.left;
      const maxLeftPx = rect.width - clipWidthPx;
      const clampedLeftPx = Math.max(0, Math.min(leftPx, maxLeftPx));
      const nextStart = (clampedLeftPx / rect.width) * duration;
      onChangeRef.current(clampAudioStart(nextStart, duration));
    };

    const onUp = () => setDragging(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [clipWidthPercent, dragging, duration]);

  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!needsSelection || dragging) return;
    const time = timeFromClientX(event.clientX);
    const centered = time - AUDIO_CLIP_DURATION / 2;
    onChange(clampAudioStart(centered, duration));
  };

  const togglePreview = async () => {
    const audio = audioRef.current;
    if (!audio || loading) return;

    if (previewing) {
      audio.pause();
      setPreviewing(false);
      return;
    }

    audio.currentTime = startTime;
    try {
      await audio.play();
      setPreviewing(true);
    } catch {
      setPreviewing(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-white/70">Fragmento del perfil</p>
          <p className="text-xs text-white/40">
            {needsSelection
              ? `Elige ${AUDIO_CLIP_DURATION} segundos que se repetirán en tu perfil`
              : "Esta pista dura menos de 30 s y se reproducirá completa"}
          </p>
        </div>
        <button
          type="button"
          onClick={togglePreview}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-200 text-xs font-medium hover:bg-purple-600/30 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : previewing ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {previewing ? "Detener" : "Escuchar"}
        </button>
      </div>

      <div className="space-y-2">
        <div
          ref={trackRef}
          role="slider"
          aria-label="Inicio del fragmento de audio"
          aria-valuemin={0}
          aria-valuemax={Math.max(0, duration - AUDIO_CLIP_DURATION)}
          aria-valuenow={startTime}
          aria-valuetext={`${formatAudioTime(startTime)} a ${formatAudioTime(clipEnd)}`}
          tabIndex={needsSelection ? 0 : -1}
          onClick={handleTrackClick}
          onKeyDown={(event) => {
            if (!needsSelection) return;
            const step = event.shiftKey ? 5 : 1;
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              onChange(clampAudioStart(startTime - step, duration));
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              onChange(clampAudioStart(startTime + step, duration));
            }
          }}
          className={`relative h-10 rounded-lg bg-black/40 border border-white/10 overflow-hidden ${
            needsSelection ? "cursor-pointer" : "cursor-default"
          }`}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-white/30" />
            </div>
          ) : (
            <>
              <div className="absolute inset-y-0 left-0 right-0 bg-white/[0.03]" />
              <div
                className={`absolute inset-y-1 rounded-md bg-purple-500/35 border border-purple-400/50 ${
                  needsSelection ? "cursor-grab active:cursor-grabbing" : ""
                } ${dragging ? "ring-1 ring-purple-400/60" : ""}`}
                style={{
                  left: `${clipLeftPercent}%`,
                  width: `${clipWidthPercent}%`,
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  beginDrag(event.clientX);
                }}
              />
            </>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/40 tabular-nums">
          <span>{formatAudioTime(startTime)}</span>
          <span className="text-white/25">
            {needsSelection
              ? `${AUDIO_CLIP_DURATION}s seleccionados`
              : formatAudioTime(duration)}
          </span>
          <span>{formatAudioTime(Math.min(clipEnd, duration || clipEnd))}</span>
        </div>

        {needsSelection && (
          <input
            type="range"
            min={0}
            max={Math.max(0, duration - AUDIO_CLIP_DURATION)}
            step={0.1}
            value={startTime}
            onChange={(event) =>
              onChange(clampAudioStart(parseFloat(event.target.value), duration))
            }
            className="w-full h-1 accent-purple-500 cursor-pointer"
            aria-label="Posición del fragmento"
          />
        )}
      </div>
    </div>
  );
}
