"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import {
  clampAudioStart,
  DEFAULT_CLIP_DURATION,
  getAudioClipBounds,
} from "@/lib/audio-config";
import { noteMediaUserActivation, canAttemptUnmutedAutoplay, markMediaUnlockedSession } from "@/lib/media-gesture";
import { getMediaSrc } from "@/lib/media-url";
import { consumePendingGestureUnlock, setProfileAudioGesturePlay } from "@/lib/profile-audio-bridge";

const VOLUME_STORAGE_KEY = "eyed-audio-volume";
const LOOP_SEEK_MARGIN = 0.2;
const AUTOPLAY_RETRY_MS = 150;
const AUTOPLAY_RETRY_MAX = 25;

function readInitialVolume(): number {
  if (typeof window === "undefined") return 0.7;

  const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
  if (saved !== null) {
    const parsed = parseFloat(saved);
    if (!Number.isNaN(parsed)) {
      return Math.min(1, Math.max(0, parsed));
    }
  }

  const touchCapable =
    window.matchMedia("(pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0 ||
    "ontouchstart" in window;

  return touchCapable ? 1 : 0.7;
}

interface Props {
  url: string;
  startTime?: number;
  clipDuration?: number;
  volumeOnly?: boolean;
  enabled: boolean;
  accentColor?: string;
  variant?: "floating" | "card";
}

export default function ProfileAudio({
  url,
  startTime = 0,
  clipDuration = DEFAULT_CLIP_DURATION,
  volumeOnly = false,
  enabled,
  variant = "floating",
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantsPlayRef = useRef(true);
  const userPausedRef = useRef(false);
  const wasPlayingBeforeMuteRef = useRef(false);
  const mutedForAutoplayRef = useRef(false);
  const clipBoundsRef = useRef({ start: 0, end: Infinity, nativeLoop: false });
  const volumeRef = useRef(0.7);
  const autoplayAttemptsRef = useRef(0);
  const volumeBeforeMuteRef = useRef(0.7);

  const [volume, setVolume] = useState(readInitialVolume);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [awaitingUnmute, setAwaitingUnmute] = useState(false);

  const src = getMediaSrc(url);
  const clipStart = clampAudioStart(startTime, duration || Infinity, clipDuration);
  const clipBounds = useMemo(
    () => getAudioClipBounds(duration, startTime, clipDuration),
    [clipDuration, duration, startTime]
  );

  clipBoundsRef.current = clipBounds;
  volumeRef.current = volume;

  const syncPlayingState = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(!audio.paused && !audio.ended);
  }, []);

  const seekToClipStart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = clipBoundsRef.current.start;
  }, []);

  const applyVolumeToAudio = useCallback((audio: HTMLAudioElement, nextVolume: number) => {
    audio.volume = nextVolume;
    if (nextVolume === 0) {
      audio.muted = true;
      return;
    }
    if (!mutedForAutoplayRef.current) {
      audio.muted = false;
    }
  }, []);

  const runPlay = useCallback(
    (fromStart: boolean) => {
      const audio = audioRef.current;
      if (!audio || !enabled || volumeRef.current === 0) return;

      if (fromStart) {
        seekToClipStart();
      }

      wantsPlayRef.current = true;
      userPausedRef.current = false;
      applyVolumeToAudio(audio, volumeRef.current);

      if (mutedForAutoplayRef.current && volumeRef.current > 0) {
        audio.muted = false;
        mutedForAutoplayRef.current = false;
        setAwaitingUnmute(false);
      }

      const playPromise = audio.play();
      if (playPromise === undefined) return;

      playPromise
        .then(() => {
          setNeedsInteraction(false);
          syncPlayingState();
        })
        .catch(() => {
          setNeedsInteraction(true);
          syncPlayingState();
        });
    },
    [applyVolumeToAudio, enabled, seekToClipStart, syncPlayingState]
  );

  const unlockFromUserGestureSync = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !enabled || userPausedRef.current || volumeRef.current === 0) return;

    noteMediaUserActivation();
    wantsPlayRef.current = true;

    const unmuteNow = () => {
      mutedForAutoplayRef.current = false;
      setAwaitingUnmute(false);
      audio.volume = volumeRef.current;
      audio.muted = false;
    };

    if (mutedForAutoplayRef.current) {
      unmuteNow();
      markMediaUnlockedSession();
    } else {
      audio.volume = volumeRef.current;
      audio.muted = false;
    }

    const { start, end } = clipBoundsRef.current;
    if (audio.paused || audio.ended || audio.currentTime < start || audio.currentTime >= end - 0.05) {
      audio.currentTime = clipBoundsRef.current.start;
    }

    if (audio.paused || audio.ended) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            markMediaUnlockedSession();
            setNeedsInteraction(false);
            setAwaitingUnmute(false);
            syncPlayingState();
          })
          .catch(() => {
            setNeedsInteraction(true);
            syncPlayingState();
          });
      }
    } else {
      markMediaUnlockedSession();
      setNeedsInteraction(false);
      setAwaitingUnmute(false);
      syncPlayingState();
    }
  }, [enabled, syncPlayingState]);

  const tryAutoplay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !enabled || volumeRef.current === 0 || userPausedRef.current) return false;

    if (!audio.paused && !audio.ended) {
      syncPlayingState();
      return true;
    }

    seekToClipStart();
    wantsPlayRef.current = true;
    applyVolumeToAudio(audio, volumeRef.current);

    try {
      audio.muted = false;
      mutedForAutoplayRef.current = false;
      await audio.play();
      markMediaUnlockedSession();
      setAwaitingUnmute(false);
      setNeedsInteraction(false);
      syncPlayingState();
      return true;
    } catch {
      /* Política del navegador: Chrome/Safari suelen exigir silencio al inicio */
    }

    try {
      audio.muted = true;
      mutedForAutoplayRef.current = true;
      await audio.play();
      setAwaitingUnmute(true);
      setNeedsInteraction(true);
      syncPlayingState();
      return true;
    } catch {
      setAwaitingUnmute(false);
      setNeedsInteraction(true);
      syncPlayingState();
      return false;
    }
  }, [applyVolumeToAudio, enabled, seekToClipStart, syncPlayingState]);

  const pausePlayback = useCallback(
    (userInitiated: boolean) => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.pause();
      syncPlayingState();
      if (userInitiated) {
        userPausedRef.current = true;
        wantsPlayRef.current = false;
      }
    },
    [syncPlayingState]
  );

  const resumePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !enabled || volumeRef.current === 0 || userPausedRef.current) return;

    wantsPlayRef.current = true;
    applyVolumeToAudio(audio, volumeRef.current);

    const playPromise = audio.play();
    if (playPromise === undefined) return;

    playPromise
      .then(() => {
        setNeedsInteraction(false);
        syncPlayingState();
      })
      .catch(() => {
        setNeedsInteraction(true);
        syncPlayingState();
      });
  }, [applyVolumeToAudio, enabled, syncPlayingState]);

  const restartClipLoop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !enabled || userPausedRef.current || volumeRef.current === 0) return;

    seekToClipStart();

    if (audio.paused && wantsPlayRef.current) {
      void audio.play().catch(() => setNeedsInteraction(true));
    }
  }, [enabled, seekToClipStart]);

  const togglePlayPause = useCallback(() => {
    if (volumeOnly) return;

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
      mutedForAutoplayRef.current = false;
    }

    userPausedRef.current = false;
    wantsPlayRef.current = true;

    if (mutedForAutoplayRef.current && volumeRef.current > 0) {
      audio.muted = false;
      mutedForAutoplayRef.current = false;
    }

    const { start, end } = clipBoundsRef.current;
    if (audio.currentTime < start || audio.currentTime >= end - 0.05 || audio.ended) {
      seekToClipStart();
    }

    const playPromise = audio.play();
    if (playPromise === undefined) return;

    playPromise
      .then(() => {
        setNeedsInteraction(false);
        syncPlayingState();
      })
      .catch(() => {
        setNeedsInteraction(true);
        syncPlayingState();
      });
  }, [enabled, isTouchDevice, pausePlayback, seekToClipStart, syncPlayingState, volumeOnly]);

  useEffect(() => {
    userPausedRef.current = false;
    wantsPlayRef.current = true;
    mutedForAutoplayRef.current = false;
    autoplayAttemptsRef.current = 0;
    setNeedsInteraction(false);
    setAwaitingUnmute(false);
    setDuration(0);
    setIsPlaying(false);
  }, [src]);

  useEffect(() => {
    setProfileAudioGesturePlay(unlockFromUserGestureSync);
    if (consumePendingGestureUnlock()) {
      unlockFromUserGestureSync();
    }
    return () => setProfileAudioGesturePlay(null);
  }, [unlockFromUserGestureSync]);

  useLayoutEffect(() => {
    if (!enabled || volumeRef.current === 0) return;
    if (canAttemptUnmutedAutoplay()) {
      unlockFromUserGestureSync();
      return;
    }
    void tryAutoplay();
  }, [enabled, src, tryAutoplay, unlockFromUserGestureSync]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const touchCapable =
      navigator.maxTouchPoints > 0 || "ontouchstart" in window;
    setIsTouchDevice(coarse || touchCapable);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    applyVolumeToAudio(audio, volume);

    if (volume === 0) {
      wasPlayingBeforeMuteRef.current = !audio.paused;
      audio.pause();
      syncPlayingState();
      return;
    }

    if (wasPlayingBeforeMuteRef.current && !userPausedRef.current) {
      wasPlayingBeforeMuteRef.current = false;
      resumePlayback();
    }
  }, [applyVolumeToAudio, resumePlayback, syncPlayingState, volume, src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = clipBounds.nativeLoop;

    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      audio.loop = getAudioClipBounds(audio.duration, startTime, clipDuration).nativeLoop;
    };

    const onPlay = () => syncPlayingState();
    const onPause = () => syncPlayingState();
    const onPlaying = () => syncPlayingState();

    const onTimeUpdate = () => {
      const { start, end, nativeLoop } = clipBoundsRef.current;
      if (nativeLoop || !Number.isFinite(end)) return;
      if (audio.currentTime >= end - LOOP_SEEK_MARGIN) {
        audio.currentTime = start;
      }
    };

    const onEnded = () => {
      if (clipBoundsRef.current.nativeLoop) return;
      restartClipLoop();
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    if (audio.readyState >= 1 && Number.isFinite(audio.duration)) {
      onLoaded();
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [clipBounds.nativeLoop, clipDuration, restartClipLoop, src, startTime, syncPlayingState]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !enabled || clipBounds.nativeLoop) return;

    const tick = () => {
      if (audio.paused || userPausedRef.current) return;
      const { start, end } = clipBoundsRef.current;
      if (!Number.isFinite(end)) return;
      if (audio.currentTime >= end - LOOP_SEEK_MARGIN) {
        audio.currentTime = start;
      }
    };

    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [clipBounds.nativeLoop, duration, enabled, src]);

  useEffect(() => {
    if (!enabled || !audioRef.current || volumeRef.current === 0) return;

    const audio = audioRef.current;
    const startPlayback = () => {
      void tryAutoplay();
    };

    void tryAutoplay();

    audio.addEventListener("loadedmetadata", startPlayback);
    audio.addEventListener("loadeddata", startPlayback);
    audio.addEventListener("canplay", startPlayback);
    audio.addEventListener("canplaythrough", startPlayback);

    return () => {
      audio.removeEventListener("loadedmetadata", startPlayback);
      audio.removeEventListener("loadeddata", startPlayback);
      audio.removeEventListener("canplay", startPlayback);
      audio.removeEventListener("canplaythrough", startPlayback);
    };
  }, [clipDuration, clipStart, enabled, src, tryAutoplay]);

  useEffect(() => {
    if (!enabled || volumeRef.current === 0) return;

    autoplayAttemptsRef.current = 0;
    const retry = window.setInterval(() => {
      if (userPausedRef.current || volumeRef.current === 0) return;

      const audio = audioRef.current;
      if (audio && !audio.paused) {
        syncPlayingState();
        window.clearInterval(retry);
        return;
      }

      autoplayAttemptsRef.current += 1;
      void tryAutoplay();

      if (autoplayAttemptsRef.current >= AUTOPLAY_RETRY_MAX) {
        window.clearInterval(retry);
      }
    }, AUTOPLAY_RETRY_MS);

    return () => window.clearInterval(retry);
  }, [enabled, src, syncPlayingState, tryAutoplay]);

  useEffect(() => {
    if (!enabled || volumeRef.current === 0) return;

    const unlock = () => {
      unlockFromUserGestureSync();
    };

    document.addEventListener("pointerdown", unlock, { capture: true });
    document.addEventListener("click", unlock, { capture: true });
    document.addEventListener("touchstart", unlock, { capture: true, passive: true });
    document.addEventListener("touchend", unlock, { capture: true, passive: true });
    document.addEventListener("keydown", unlock, { capture: true });
    window.addEventListener("focus", unlock);
    window.addEventListener("pageshow", unlock);

    return () => {
      document.removeEventListener("pointerdown", unlock, { capture: true });
      document.removeEventListener("click", unlock, { capture: true });
      document.removeEventListener("touchstart", unlock, { capture: true });
      document.removeEventListener("touchend", unlock, { capture: true });
      document.removeEventListener("keydown", unlock, { capture: true });
      window.removeEventListener("focus", unlock);
      window.removeEventListener("pageshow", unlock);
    };
  }, [enabled, unlockFromUserGestureSync]);

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
    if (next > 0) {
      volumeBeforeMuteRef.current = next;
    }
    mutedForAutoplayRef.current = false;
    setVolume(next);
    localStorage.setItem(VOLUME_STORAGE_KEY, String(next));
  };

  const handleVolumeButtonClick = () => {
    if (awaitingUnmute || mutedForAutoplayRef.current) {
      unlockFromUserGestureSync();
      if (volumeOnly) return;
    }

    if (volumeOnly) {
      if (volume === 0) {
        const restored =
          volumeBeforeMuteRef.current > 0
            ? volumeBeforeMuteRef.current
            : isTouchDevice
              ? 1
              : 0.7;
        handleVolumeChange(restored);
      } else {
        volumeBeforeMuteRef.current = volume;
        handleVolumeChange(0);
      }
      return;
    }

    if (isTouchDevice) {
      setShowVolume((prev) => !prev);
      return;
    }
    setShowVolume(true);
  };

  const muted = volume === 0;
  const showUnlockHint = awaitingUnmute && volume > 0;
  const waitingForTap = (needsInteraction || showUnlockHint) && !muted && !volumeOnly;
  const waitingForTapVolume = (needsInteraction || showUnlockHint) && !muted && volumeOnly;

  const controlsShell =
    variant === "card"
      ? "group flex items-center rounded-lg bg-black/35 backdrop-blur-md border border-white/10 text-white/75 hover:text-white transition-all duration-300 ease-out overflow-hidden"
      : `group flex items-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-all duration-300 ease-out overflow-hidden ${
          isTouchDevice && showVolume ? "pr-3" : ""
        }`;

  const sliderReveal =
    volumeOnly && variant === "card"
      ? "w-[88px] opacity-100 pr-2"
      : variant === "card"
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
        autoPlay
        loop={clipBounds.nativeLoop}
        playsInline
        // eslint-disable-next-line react/no-unknown-property
        webkit-playsinline="true"
      />
      <div className={wrapperClass}>
        <div className={controlsShell}>
          {!volumeOnly ? (
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
          ) : null}

          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleVolumeButtonClick}
            className={`${buttonPadding} ${
              waitingForTapVolume
                ? "animate-pulse ring-2 ring-purple-400/60 ring-offset-1 ring-offset-transparent rounded-lg"
                : ""
            }`}
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
