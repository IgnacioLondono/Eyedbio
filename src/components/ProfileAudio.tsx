"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";

const VOLUME_STORAGE_KEY = "eyed-audio-volume";

interface Props {
  url: string;
  enabled: boolean;
  accentColor?: string;
}

export default function ProfileAudio({ url, enabled, accentColor = "#a855f7" }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showVolume, setShowVolume] = useState(false);

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
    if (!enabled || !audioRef.current) return;

    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [enabled, url]);

  useEffect(() => {
    if (!showVolume) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setShowVolume(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showVolume]);

  if (!enabled || !url) return null;

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const handleVolumeChange = (value: number) => {
    const next = Math.min(1, Math.max(0, value));
    setVolume(next);
    localStorage.setItem(VOLUME_STORAGE_KEY, String(next));
  };

  const muted = volume === 0;

  return (
    <>
      <audio ref={audioRef} src={url} loop preload="auto" />
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2">
        <div ref={panelRef} className="relative flex items-center">
          {showVolume && (
            <div className="absolute bottom-full right-0 mb-2 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 shadow-xl min-w-[160px]">
              {muted ? (
                <VolumeX className="w-4 h-4 text-white/60 shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 text-white/60 shrink-0" />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 accent-purple-500 cursor-pointer"
                aria-label="Volumen"
              />
              <span className="text-[10px] text-white/50 w-7 text-right tabular-nums">
                {Math.round(volume * 100)}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowVolume((open) => !open)}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors"
            aria-label={showVolume ? "Cerrar control de volumen" : "Ajustar volumen"}
            aria-expanded={showVolume}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all"
          style={{
            boxShadow: playing ? `0 0 20px ${accentColor}44` : undefined,
          }}
        >
          <Music className="w-4 h-4" style={{ color: playing ? accentColor : undefined }} />
          <span className="text-xs font-medium">{playing ? "Reproduciendo" : "Reproducir"}</span>
        </button>
      </div>
    </>
  );
}
