"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { AUDIO_CLIP_DURATION, clampAudioStart } from "@/lib/audio-config";

const VOLUME_STORAGE_KEY = "eyed-audio-volume";

interface Props {
  url: string;
  startTime?: number;
  enabled: boolean;
  accentColor?: string;
}

export default function ProfileAudio({ url, startTime = 0, enabled }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);

  const clipStart = clampAudioStart(startTime, duration || Infinity);
  const clipEnd = clipStart + AUDIO_CLIP_DURATION;

  useEffect(() => {
    const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!Number.isNaN(parsed)) {
        setVolume(Math.min(1, Math.max(0, parsed)));
      }
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = volume === 0;
  }, [volume, url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      const end =
        audio.duration > AUDIO_CLIP_DURATION
          ? clipStart + AUDIO_CLIP_DURATION
          : audio.duration;

      if (Number.isFinite(end) && audio.currentTime >= end) {
        audio.currentTime = clipStart;
      }
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [clipStart, url]);

  useEffect(() => {
    if (!enabled || !audioRef.current) return;

    const audio = audioRef.current;
    const playFromClip = () => {
      audio.currentTime = clipStart;
      audio.play().catch(() => {});
    };

    if (audio.readyState >= 1) {
      playFromClip();
    } else {
      audio.addEventListener("loadedmetadata", playFromClip, { once: true });
      return () => audio.removeEventListener("loadedmetadata", playFromClip);
    }
  }, [clipStart, enabled, url]);

  if (!enabled || !url) return null;

  const handleVolumeChange = (value: number) => {
    const next = Math.min(1, Math.max(0, value));
    setVolume(next);
    localStorage.setItem(VOLUME_STORAGE_KEY, String(next));
  };

  const muted = volume === 0;

  return (
    <>
      <audio ref={audioRef} src={url} preload="auto" />
      <div className="fixed bottom-6 right-6 z-30">
        <div className="group flex items-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-all duration-300 ease-out overflow-hidden">
          <div className="p-2.5 shrink-0" aria-hidden>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </div>
          <div className="flex items-center gap-2 w-0 opacity-0 group-hover:w-[130px] group-hover:opacity-100 group-hover:pr-3 transition-all duration-300 ease-out overflow-hidden">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 min-w-0 h-1.5 accent-purple-500 cursor-pointer"
              aria-label="Volumen"
            />
            <span className="text-[10px] text-white/50 w-7 text-right tabular-nums shrink-0">
              {Math.round(volume * 100)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
