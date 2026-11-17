"use client";

import { useEffect, useRef, useSyncExternalStore, useState } from "react";
import { Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import { DEFAULT_CLIP_DURATION } from "@/lib/config/audio-config";
import {
  getBackgroundVideoAudioServerSnapshot,
  getBackgroundVideoAudioSnapshot,
  getBackgroundVideoVolumeBeforeMute,
  setBackgroundVideoVolume,
  subscribeBackgroundVideoAudio,
  unmuteBackgroundVideoFromUserGesture,
} from "@/lib/profile/profile-background-video-audio";
import {
  configureProfileAudioEngine,
  destroyProfileAudioEngine,
  getProfileAudioEngineServerSnapshot,
  getProfileAudioEngineSnapshot,
  playProfileAudioFromUserGesture,
  setProfileAudioVolume,
  subscribeProfileAudioEngine,
  toggleProfileAudioPlayPause,
} from "@/lib/profile/profile-audio-engine";

interface Props {
  url: string;
  startTime?: number;
  clipDuration?: number;
  volumeOnly?: boolean;
  enabled: boolean;
  accentColor?: string;
  variant?: "floating" | "card";
}

function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
  if (muted || volume <= 0.001) return <VolumeX className="h-4 w-4" />;
  if (volume < 0.45) return <Volume1 className="h-4 w-4" />;
  return <Volume2 className="h-4 w-4" />;
}

export default function ProfileAudio({
  url,
  startTime = 0,
  clipDuration = DEFAULT_CLIP_DURATION,
  volumeOnly = false,
  enabled,
  accentColor = "#a855f7",
  variant = "floating",
}: Props) {
  const uploadSnapshot = useSyncExternalStore(
    subscribeProfileAudioEngine,
    getProfileAudioEngineSnapshot,
    getProfileAudioEngineServerSnapshot
  );

  const videoSnapshot = useSyncExternalStore(
    subscribeBackgroundVideoAudio,
    getBackgroundVideoAudioSnapshot,
    getBackgroundVideoAudioServerSnapshot
  );

  const [expanded, setExpanded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || volumeOnly || !url) return;

    configureProfileAudioEngine({
      src: url,
      startTime,
      clipDuration,
      enabled,
    });

    return () => {
      destroyProfileAudioEngine();
    };
  }, [clipDuration, enabled, startTime, url, volumeOnly]);

  useEffect(() => {
    if (!enabled || !volumeOnly) return;
    destroyProfileAudioEngine();
  }, [enabled, volumeOnly, url]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const touchCapable = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
    setIsTouchDevice(coarse || touchCapable);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [expanded]);

  if (!enabled || !url) return null;

  const volume = volumeOnly ? videoSnapshot.volume : uploadSnapshot.volume;
  const isPlaying = volumeOnly ? videoSnapshot.isPlaying : uploadSnapshot.isPlaying;
  const needsTap = volumeOnly ? videoSnapshot.needsTap : uploadSnapshot.needsTap;
  const muted = volumeOnly ? videoSnapshot.muted : volume === 0;
  const waitingForTap = volumeOnly
    ? videoSnapshot.needsTap
    : uploadSnapshot.awaitingUnlock && volume > 0;

  const handleVolumeChange = (value: number) => {
    if (volumeOnly) {
      setBackgroundVideoVolume(value);
      return;
    }
    setProfileAudioVolume(value);
  };

  const unlockAudio = () => {
    if (volumeOnly) {
      unmuteBackgroundVideoFromUserGesture();
      return;
    }
    if (needsTap || uploadSnapshot.awaitingUnlock) {
      playProfileAudioFromUserGesture();
    }
  };

  const toggleMute = () => {
    unlockAudio();
    if (muted || volume <= 0.001) {
      const restored = volumeOnly ? getBackgroundVideoVolumeBeforeMute() : 0.7;
      handleVolumeChange(restored > 0.05 ? restored : isTouchDevice ? 1 : 0.7);
      return;
    }
    handleVolumeChange(0);
  };

  const handleSpeakerClick = () => {
    if (isTouchDevice) {
      if (!expanded) {
        setExpanded(true);
        unlockAudio();
        return;
      }
      toggleMute();
      return;
    }
    toggleMute();
  };

  // Card: icon compacto; slider al hover (desktop) o 1er tap (móvil)
  const controlsShell =
    variant === "card"
      ? "group/audio relative flex items-center overflow-hidden rounded-xl text-white/85 transition-colors"
      : `group flex items-center rounded-full bg-black/45 backdrop-blur-xl border border-white/12 text-white/80 hover:text-white transition-all duration-300 ease-out overflow-hidden shadow-lg shadow-black/30 ${
          isTouchDevice && expanded ? "pr-3" : ""
        }`;

  const sliderWidth =
    variant === "card"
      ? isTouchDevice
        ? expanded
          ? "w-[92px] opacity-100 pr-2"
          : "w-0 opacity-0"
        : "w-0 opacity-0 group-hover/audio:w-[92px] group-hover/audio:opacity-100 group-hover/audio:pr-2 group-focus-within/audio:w-[92px] group-focus-within/audio:opacity-100 group-focus-within/audio:pr-2"
      : isTouchDevice
        ? expanded
          ? "w-[120px] opacity-100"
          : "w-0 opacity-0"
        : "w-0 opacity-0 group-hover:w-[120px] group-hover:opacity-100 group-hover:pr-3";

  const wrapperClass = variant === "card" ? "" : "fixed bottom-6 right-6 z-30";
  const iconBtn =
    variant === "card"
      ? "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/85 transition hover:bg-white/10 hover:text-white active:scale-95"
      : "p-3 sm:p-2.5 shrink-0";

  const percent = Math.round(Math.min(1, Math.max(0, volume)) * 100);

  return (
    <div className={wrapperClass} ref={rootRef}>
      <div
        className={controlsShell}
        onMouseEnter={() => {
          if (!isTouchDevice && variant === "card") setExpanded(true);
        }}
        onMouseLeave={() => {
          if (!isTouchDevice && variant === "card") setExpanded(false);
        }}
      >
        {!volumeOnly ? (
          <button
            type="button"
            onPointerDown={() => {
              if (needsTap || uploadSnapshot.awaitingUnlock) {
                playProfileAudioFromUserGesture();
              }
            }}
            onClick={toggleProfileAudioPlayPause}
            className={`${iconBtn} ${
              waitingForTap ? "animate-pulse ring-2 ring-white/30 ring-offset-1 ring-offset-transparent" : ""
            }`}
            aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        ) : null}

        <button
          type="button"
          onPointerDown={unlockAudio}
          onClick={handleSpeakerClick}
          className={`${iconBtn} ${
            waitingForTap && volumeOnly
              ? "animate-pulse ring-2 ring-white/30 ring-offset-1 ring-offset-transparent"
              : ""
          }`}
          aria-label={muted ? "Activar sonido" : "Silenciar o ajustar volumen"}
          aria-expanded={expanded}
          title={muted ? "Sonido off — toca para activar" : "Volumen"}
        >
          <VolumeIcon volume={volume} muted={muted} />
        </button>

        <div
          className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-out ${sliderWidth}`}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onPointerDown={unlockAudio}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="profile-volume-slider min-w-0 flex-1 cursor-pointer"
            style={
              {
                "--volume-accent": accentColor,
                "--volume-pct": `${percent}%`,
              } as React.CSSProperties
            }
            aria-label="Volumen"
          />
          {variant !== "card" && (
            <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-white/50">
              {percent}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
