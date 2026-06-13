"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import {
  clampAudioStart,
  formatAudioTime,
  getClipDurationOptions,
  getEffectiveClipDuration,
  isFullAudioClip,
  normalizeClipDuration,
} from "@/lib/audio-config";
import { getMediaSrc } from "@/lib/media-url";
import { useI18n } from "@/components/LocaleProvider";
import { t as translate, tVars as translateVars } from "@/lib/i18n";

interface Props {
  audioUrl: string;
  startTime: number;
  clipDuration: number;
  onChange: (next: { startTime: number; clipDuration: number }) => void;
}

export default function AudioClipSelector({
  audioUrl,
  startTime,
  clipDuration,
  onChange,
}: Props) {
  const { locale } = useI18n();
  const t = (path: string) => translate(locale, path);
  const tV = (path: string, vars: Record<string, string | number>) =>
    translateVars(locale, path, vars);

  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef(0);
  const onChangeRef = useRef(onChange);
  const startTimeRef = useRef(startTime);
  const clipDurationRef = useRef(clipDuration);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [dragging, setDragging] = useState(false);

  onChangeRef.current = onChange;
  startTimeRef.current = startTime;
  clipDurationRef.current = clipDuration;

  const src = getMediaSrc(audioUrl);
  const effectiveClipDuration = getEffectiveClipDuration(clipDuration, duration);
  const useFullAudio = effectiveClipDuration <= 0;
  const activeClipDuration = useFullAudio ? duration : effectiveClipDuration;
  const clipEnd = startTime + activeClipDuration;
  const needsSelection = !useFullAudio && duration > activeClipDuration;
  const durationOptions = useMemo(() => getClipDurationOptions(duration), [duration]);
  const clipWidthPercent =
    duration > 0 && activeClipDuration > 0
      ? Math.min((activeClipDuration / duration) * 100, 100)
      : 100;
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

      const normalizedDuration = normalizeClipDuration(clipDurationRef.current, nextDuration);
      const clampedStart = clampAudioStart(
        startTimeRef.current,
        nextDuration,
        normalizedDuration
      );

      if (
        normalizedDuration !== clipDurationRef.current ||
        clampedStart !== startTimeRef.current
      ) {
        onChangeRef.current({
          startTime: clampedStart,
          clipDuration: normalizedDuration,
        });
      }

      setLoading(false);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    return () => audio.removeEventListener("loadedmetadata", onLoaded);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || loading || !previewing) return;

    const effective = getEffectiveClipDuration(clipDuration, duration || Infinity);
    const clamped = clampAudioStart(startTime, duration || Infinity, effective);
    if (Math.abs(audio.currentTime - clamped) > 0.05) {
      audio.currentTime = clamped;
    }
  }, [startTime, clipDuration, previewing, loading, duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!previewing) return;

      const effective = getEffectiveClipDuration(
        clipDurationRef.current,
        audio.duration
      );
      const end =
        effective > 0 && Number.isFinite(audio.duration)
          ? startTimeRef.current + effective
          : audio.duration;

      if (Number.isFinite(end) && audio.currentTime >= end - 0.05) {
        audio.currentTime =
          effective > 0 ? startTimeRef.current : 0;
      }
    };

    const onEnded = () => setPreviewing(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [previewing]);

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
      onChangeRef.current({
        startTime: clampAudioStart(nextStart, duration, clipDurationRef.current),
        clipDuration: clipDurationRef.current,
      });
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
    const centered = time - activeClipDuration / 2;
    onChange({
      startTime: clampAudioStart(centered, duration, clipDuration),
      clipDuration,
    });
  };

  const handleDurationSelect = (nextDuration: number) => {
    const normalized = normalizeClipDuration(nextDuration, duration);
    onChange({
      clipDuration: normalized,
      startTime: clampAudioStart(startTime, duration, normalized),
    });
  };

  const togglePreview = async () => {
    const audio = audioRef.current;
    if (!audio || loading) return;

    if (previewing) {
      audio.pause();
      setPreviewing(false);
      return;
    }

    const effective = getEffectiveClipDuration(clipDuration, duration || Infinity);
    audio.currentTime = effective > 0 ? startTime : 0;
    try {
      await audio.play();
      setPreviewing(true);
    } catch {
      setPreviewing(false);
    }
  };

  const formatDurationLabel = (value: number) =>
    isFullAudioClip(value) ? t("dashboard.audioClipFull") : `${value}s`;

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <audio ref={audioRef} src={src} preload="auto" />

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-white/70">{t("dashboard.audioClipTitle")}</p>
          <p className="text-xs text-white/40">
            {useFullAudio
              ? t("dashboard.audioClipFullHint")
              : tV("dashboard.audioClipDurationHint", { seconds: activeClipDuration })}
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
          {previewing ? t("dashboard.audioClipStop") : t("dashboard.audioClipPreview")}
        </button>
      </div>

      {!loading && durationOptions.length > 1 ? (
        <div className="space-y-2">
          <p className="text-[11px] text-white/45 uppercase tracking-wide">
            {t("dashboard.audioClipDurationLabel")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {durationOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleDurationSelect(option)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  (option === 0 && useFullAudio) ||
                  (option > 0 && !useFullAudio && option === effectiveClipDuration)
                    ? "border-purple-500/50 bg-purple-500/20 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/80"
                }`}
              >
                {formatDurationLabel(option)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {needsSelection ? (
        <div className="space-y-2">
          <p className="text-[11px] text-white/45">{t("dashboard.audioClipPositionHint")}</p>
          <div
            ref={trackRef}
            role="slider"
            aria-label={t("dashboard.audioClipTitle")}
            aria-valuemin={0}
            aria-valuemax={Math.max(0, duration - activeClipDuration)}
            aria-valuenow={startTime}
            aria-valuetext={`${formatAudioTime(startTime)} a ${formatAudioTime(clipEnd)}`}
            tabIndex={0}
            onClick={handleTrackClick}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 5 : 1;
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                onChange({
                  startTime: clampAudioStart(startTime - step, duration, clipDuration),
                  clipDuration,
                });
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                onChange({
                  startTime: clampAudioStart(startTime + step, duration, clipDuration),
                  clipDuration,
                });
              }
            }}
            className="relative h-10 rounded-lg bg-black/40 border border-white/10 overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-y-0 left-0 right-0 bg-white/[0.03]" />
            <div
              className={`absolute inset-y-1 rounded-md bg-purple-500/35 border border-purple-400/50 cursor-grab active:cursor-grabbing ${
                dragging ? "ring-1 ring-purple-400/60" : ""
              }`}
              style={{
                left: `${clipLeftPercent}%`,
                width: `${clipWidthPercent}%`,
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                beginDrag(event.clientX);
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/40 tabular-nums">
            <span>{formatAudioTime(startTime)}</span>
            <span className="text-white/25">
              {tV("dashboard.audioClipSelected", { seconds: activeClipDuration })}
            </span>
            <span>{formatAudioTime(Math.min(clipEnd, duration || clipEnd))}</span>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(0, duration - activeClipDuration)}
            step={0.1}
            value={startTime}
            onChange={(event) =>
              onChange({
                startTime: clampAudioStart(parseFloat(event.target.value), duration, clipDuration),
                clipDuration,
              })
            }
            className="w-full h-1 accent-purple-500 cursor-pointer"
            aria-label={t("dashboard.audioClipTitle")}
          />
        </div>
      ) : !loading && duration > 0 ? (
        <p className="text-[11px] text-white/40 tabular-nums">
          {t("dashboard.audioClipShortTrack")}: {formatAudioTime(duration)}
        </p>
      ) : null}
    </div>
  );
}
