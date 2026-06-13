"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { DEFAULT_CLIP_DURATION } from "@/lib/audio-config";
import {
  configureProfileAudioEngine,
  getProfileAudioEngineSnapshot,
  playProfileAudioFromUserGesture,
  setProfileAudioVolume,
  subscribeProfileAudioEngine,
  toggleProfileAudioPlayPause,
} from "@/lib/profile-audio-engine";

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
  const snapshot = useSyncExternalStore(
    subscribeProfileAudioEngine,
    getProfileAudioEngineSnapshot,
    getProfileAudioEngineSnapshot
  );

  const [showVolume, setShowVolume] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (!enabled || !url) return;
    configureProfileAudioEngine({
      src: url,
      startTime,
      clipDuration,
      enabled,
    });
  }, [clipDuration, enabled, startTime, url]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const touchCapable = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
    setIsTouchDevice(coarse || touchCapable);
  }, []);

  if (!enabled || !url) return null;

  const { isPlaying, volume, awaitingUnlock } = snapshot;
  const muted = volume === 0;
  const waitingForTap = awaitingUnlock && !muted;
  const volumeBeforeMuteRef = { current: volume > 0 ? volume : 0.7 };

  const handleVolumeChange = (value: number) => {
    setProfileAudioVolume(value);
  };

  const handleVolumeButtonClick = () => {
    if (awaitingUnlock) {
      playProfileAudioFromUserGesture();
      if (volumeOnly) return;
    }

    if (volumeOnly) {
      if (volume === 0) {
        handleVolumeChange(volumeBeforeMuteRef.current > 0 ? volumeBeforeMuteRef.current : isTouchDevice ? 1 : 0.7);
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

  const wrapperClass = variant === "card" ? "" : "fixed bottom-6 right-6 z-30";
  const buttonPadding = variant === "card" ? "p-2 shrink-0" : "p-3 sm:p-2.5 shrink-0";

  return (
    <div className={wrapperClass}>
      <div className={controlsShell}>
        {!volumeOnly ? (
          <button
            type="button"
            onClick={toggleProfileAudioPlayPause}
            className={`${buttonPadding} ${
              waitingForTap && !volumeOnly
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
          onClick={handleVolumeButtonClick}
          className={`${buttonPadding} ${
            waitingForTap && volumeOnly
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
  );
}
