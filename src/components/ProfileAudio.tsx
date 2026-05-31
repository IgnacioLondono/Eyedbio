"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";

interface Props {
  url: string;
  enabled: boolean;
  accentColor?: string;
}

export default function ProfileAudio({ url, enabled, accentColor = "#a855f7" }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!enabled || !audioRef.current) return;

    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [enabled, url]);

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

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  return (
    <>
      <audio ref={audioRef} src={url} loop preload="auto" />
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2">
        <button
          onClick={toggleMute}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors"
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button
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
