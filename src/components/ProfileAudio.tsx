"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { AUDIO_CLIP_DURATION, clampAudioStart } from "@/lib/audio-config";
import { getMediaSrc } from "@/lib/media-url";

const VOLUME_STORAGE_KEY = "eyed-audio-volume";

interface Props {
  url: string;
  startTime?: number;
  enabled: boolean;
  accentColor?: string;
  variant?: "floating" | "card";
}

export default function ProfileAudio({
  url,
  startTime = 0,
  enabled,
  variant = "floating",
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantsPlayRef = useRef(false);
  const userPausedRef = useRef(false);
  const wasPlayingBeforeMuteRef = useRef(false);
  const clipStartRef = useRef(0);
  const volumeRef = useRef(0.7);

  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const src = getMediaSrc(url);
  const clipStart = clampAudioStart(startTime, duration || Infinity);
  clipStartRef.current = clipStart;
  volumeRef.current = volume;

  const runPlay = useCallback((fromStart: boolean) => {
    const audio = audioRef.current;
    if (!audio || !enabled || volumeRef.current === 0) return;

    if (fromStart) {
      audio.currentTime = clipStartRef.current;
    }

    wantsPlayRef.current = true;
    userPausedRef.current = false;

    const playPromise = audio.play();
    if (playPromise === undefined) return;

    playPromise
      .then(() => setNeedsInteraction(false))
      .catch(() => setNeedsInteraction(true));
  }, [enabled]);

  const pausePlayback = useCallback((userInitiated: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    if (userInitiated) {
      userPausedRef.current = true;
      wantsPlayRef.current = false;
    }
  }, []);

  const resumePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !enabled || volumeRef.current === 0 || userPausedRef.current) return;

    wantsPlayRef.current = true;
    const playPromise = audio.play();
    if (playPromise === undefined) return;

    playPromise
      .then(() => setNeedsInteraction(false))
      .catch(() => setNeedsInteraction(true));
  }, [enabled]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !enabled) return;

    if (!audio.paused) {
      pausePlayback(true);
      return;
    }

    if (volumeRef.current === 0) {
      const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
      const parsed = saved !== null ? parseFloat(saved) : NaN;
      const restored =
        !Number.isNaN(parsed) && parsed > 0
          ? parsed
          : isTouchDevice
            ? 1
            : 0.7;
      setVolume(restored);
      volumeRef.current = restored;
      localStorage.setItem(VOLUME_STORAGE_KEY, String(restored));
      audio.volume = restored;
      audio.muted = false;
    }

    userPausedRef.current = false;
    wantsPlayRef.current = true;

    if (audio.currentTime < clipStartRef.current || audio.ended) {
      audio.currentTime = clipStartRef.current;
    }

    const playPromise = audio.play();
    if (playPromise === undefined) return;

    playPromise
      .then(() => setNeedsInteraction(false))
      .catch(() => setNeedsInteraction(true));
  }, [enabled, isTouchDevice, pausePlayback]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const touchCapable =
      navigator.maxTouchPoints > 0 || "ontouchstart" in window;
    setIsTouchDevice(coarse || touchCapable);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!Number.isNaN(parsed)) {
        setVolume(Math.min(1, Math.max(0, parsed)));
        return;
      }
    }
    setVolume(isTouchDevice ? 1 : 0.7);
  }, [isTouchDevice]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = volume === 0;

    if (volume === 0) {
      wasPlayingBeforeMuteRef.current = !audio.paused;
      audio.pause();
      return;
    }

    if (wasPlayingBeforeMuteRef.current && !userPausedRef.current) {
      wasPlayingBeforeMuteRef.current = false;
      resumePlayback();
    }
  }, [volume, src, resumePlayback]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onTimeUpdate = () => {
      const start = clipStartRef.current;
      const end =
        audio.duration > AUDIO_CLIP_DURATION
          ? start + AUDIO_CLIP_DURATION
          : audio.duration;

      if (Number.isFinite(end) && audio.currentTime >= end) {
        audio.currentTime = start;
      }
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [src]);

  useEffect(() => {
    if (!enabled || !audioRef.current || volumeRef.current === 0) return;

    const audio = audioRef.current;
    const attemptPlay = () => runPlay(true);

    if (audio.readyState >= 1) {
      attemptPlay();
    } else {
      audio.addEventListener("loadedmetadata", attemptPlay, { once: true });
      audio.addEventListener("canplay", attemptPlay, { once: true });
      return () => {
        audio.removeEventListener("loadedmetadata", attemptPlay);
        audio.removeEventListener("canplay", attemptPlay);
      };
    }
  }, [clipStart, enabled, src, runPlay]);

  useEffect(() => {
    if (!enabled || !needsInteraction || volumeRef.current === 0) return;

    const unlock = () => {
      const audio = audioRef.current;
      if (!audio) return;
      const hasProgress = audio.currentTime > clipStartRef.current + 0.25;
      if (audio.paused && hasProgress) {
        resumePlayback();
      } else {
        runPlay(true);
      }
    };

    document.addEventListener("pointerdown", unlock, { capture: true });
    document.addEventListener("touchstart", unlock, { capture: true, passive: true });
    document.addEventListener("keydown", unlock, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", unlock, { capture: true });
      document.removeEventListener("touchstart", unlock, { capture: true });
      document.removeEventListener("keydown", unlock, { capture: true });
    };
  }, [enabled, needsInteraction, runPlay, resumePlayback]);

  useEffect(() => {
    if (!enabled) return;

    const resumeIfNeeded = () => {
      if (document.visibilityState !== "visible") return;
      if (!wantsPlayRef.current || userPausedRef.current || volumeRef.current === 0) return;

      const audio = audioRef.current;
      if (audio?.paused) {
        resumePlayback();
      }
    };

    document.addEventListener("visibilitychange", resumeIfNeeded);
    return () => document.removeEventListener("visibilitychange", resumeIfNeeded);
  }, [enabled, resumePlayback]);

  if (!enabled || !url) return null;

  const handleVolumeChange = (value: number) => {
    const next = Math.min(1, Math.max(0, value));
    setVolume(next);
    localStorage.setItem(VOLUME_STORAGE_KEY, String(next));
  };

  const muted = volume === 0;
  const waitingForTap = needsInteraction && !muted && !isPlaying;

  const controlsShell =
    variant === "card"
      ? "group flex items-center rounded-lg bg-black/35 backdrop-blur-md border border-white/10 text-white/75 hover:text-white transition-all duration-300 ease-out overflow-hidden"
      : `group flex items-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-all duration-300 ease-out overflow-hidden ${
          isTouchDevice && showVolume ? "pr-3" : ""
        }`;

  const sliderReveal =
    variant === "card"
      ? isTouchDevice
        ? showVolume
          ? "w-[88px] opacity-100"
          : "w-0 opacity-0"
        : "w-0 opacity-0 group-hover:w-[88px] group-hover:opacity-100 group-hover:pr-2"
      : isTouchDevice
        ? showVolume
          ? "w-[130px] opacity-100"
          : "w-0 opacity-0"
        : "w-0 opacity-0 group-hover:w-[130px] group-hover:opacity-100 group-hover:pr-3";

  const wrapperClass =
    variant === "card" ? "" : "fixed bottom-6 right-6 z-30";

  const buttonPadding = variant === "card" ? "p-2 shrink-0" : "p-3 sm:p-2.5 shrink-0";

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        playsInline
        // eslint-disable-next-line react/no-unknown-property
        webkit-playsinline="true"
      />
      <div className={wrapperClass}>
        <div className={controlsShell}>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={togglePlayPause}
            className={`${buttonPadding} ${
              waitingForTap
                ? "animate-pulse ring-2 ring-purple-400/60 ring-offset-1 ring-offset-transparent rounded-lg"
                : ""
            }`}
            aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              if (isTouchDevice) {
                setShowVolume((prev) => !prev);
                return;
              }
              setShowVolume(true);
            }}
            className={buttonPadding}
            aria-label={muted ? "Activar sonido" : "Ajustar volumen"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <div
            className={`flex items-center gap-1.5 transition-all duration-300 ease-out overflow-hidden ${sliderReveal}`}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 min-w-0 h-1 accent-purple-500 cursor-pointer"
              aria-label="Volumen"
            />
            {variant !== "card" && (
              <span className="text-[10px] text-white/50 w-7 text-right tabular-nums shrink-0">
                {Math.round(volume * 100)}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
