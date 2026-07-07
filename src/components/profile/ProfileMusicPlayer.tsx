"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Pause, Play, Volume2, VolumeX, Music } from "lucide-react";
import type { Profile } from "@/types/profile";
import { hexToRgba } from "@/lib/config/color-utils";
import { getMediaSrc } from "@/lib/media/media-url";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import {
  isMusicPlayerEnabled,
  isMusicPlayerPlayable,
  resolveMusicPlayer,
} from "@/lib/profile/music-player-config";
import {
  getProfileAudioClipProgress,
  getProfileAudioEngineServerSnapshot,
  getProfileAudioEngineSnapshot,
  playProfileAudioFromUserGesture,
  seekProfileAudioClip,
  setProfileAudioVolume,
  subscribeProfileAudioEngine,
  toggleProfileAudioPlayPause,
} from "@/lib/profile/profile-audio-engine";

interface Props {
  profile: Profile;
  /** Vista previa/estática (dashboard, landing): sin control real del audio. */
  compact?: boolean;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ProfileMusicPlayer({ profile, compact = false }: Props) {
  const site = useSiteSettings();
  const enabled = isMusicPlayerEnabled(profile.settings);
  const interactive = !compact && site.profileAudioEnabled && isMusicPlayerPlayable(profile);

  if (!enabled) return null;
  if (!compact && !interactive) return null;

  return interactive ? (
    <InteractiveMusicPlayer profile={profile} />
  ) : (
    <StaticMusicPlayer profile={profile} />
  );
}

function PlayerShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const { baseColor } = resolveMusicPlayer(profile);
  return (
    <div
      className="flex w-full items-center gap-3 rounded-2xl border p-2.5 backdrop-blur-sm"
      style={{
        background: hexToRgba(baseColor, 0.14),
        borderColor: hexToRgba(baseColor, 0.28),
      }}
    >
      {children}
    </div>
  );
}

function Cover({ profile }: { profile: Profile }) {
  const { coverUrl, baseColor, title } = resolveMusicPlayer(profile);
  const [broken, setBroken] = useState(false);
  const src = coverUrl ? getMediaSrc(coverUrl) : "";

  if (!src || broken) {
    return (
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: hexToRgba(baseColor, 0.3) }}
      >
        <Music className="h-5 w-5" style={{ color: baseColor }} />
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
      <Image
        src={src}
        alt={title}
        fill
        sizes="48px"
        className="object-cover"
        onError={() => setBroken(true)}
        unoptimized
      />
    </div>
  );
}

function StaticMusicPlayer({ profile }: { profile: Profile }) {
  const { title, artist, baseColor, textColor } = resolveMusicPlayer(profile);
  return (
    <PlayerShell profile={profile}>
      <Cover profile={profile} />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold" style={{ color: textColor }}>
          {title}
        </p>
        <p className="truncate text-xs" style={{ color: hexToRgba(textColor, 0.6) }}>
          {artist}
        </p>
        <div
          className="mt-2 h-1 w-full overflow-hidden rounded-full"
          style={{ background: hexToRgba(textColor, 0.18) }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: "35%", background: baseColor }}
          />
        </div>
      </div>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: baseColor }}
      >
        <Play className="h-4 w-4 text-white" fill="currentColor" />
      </div>
    </PlayerShell>
  );
}

function InteractiveMusicPlayer({ profile }: { profile: Profile }) {
  const { title, artist, baseColor, textColor } = resolveMusicPlayer(profile);
  const snapshot = useSyncExternalStore(
    subscribeProfileAudioEngine,
    getProfileAudioEngineSnapshot,
    getProfileAudioEngineServerSnapshot
  );

  const [progress, setProgress] = useState({ progress: 0, current: 0, total: 0 });
  const rafRef = useRef<number | null>(null);

  const volume = snapshot.volume;
  const isPlaying = snapshot.isPlaying;

  useEffect(() => {
    setProgress(getProfileAudioClipProgress());
    if (!isPlaying) return;

    const tick = () => {
      setProgress(getProfileAudioClipProgress());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  const muted = volume === 0;
  const needsTap = snapshot.needsTap || snapshot.awaitingUnlock;

  const handleToggle = () => {
    if (needsTap) {
      playProfileAudioFromUserGesture();
      return;
    }
    toggleProfileAudioPlayPause();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    seekProfileAudioClip((e.clientX - rect.left) / rect.width);
  };

  const toggleMute = () => {
    setProfileAudioVolume(muted ? 0.7 : 0);
  };

  return (
    <PlayerShell profile={profile}>
      <Cover profile={profile} />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold" style={{ color: textColor }}>
          {title}
        </p>
        <p className="truncate text-xs" style={{ color: hexToRgba(textColor, 0.6) }}>
          {artist}
        </p>
        <div
          className="group mt-2 cursor-pointer py-1"
          onClick={handleSeek}
          role="slider"
          aria-label="Progreso"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress.progress * 100)}
          tabIndex={0}
        >
          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{ background: hexToRgba(textColor, 0.18) }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, progress.progress * 100)}%`,
                background: baseColor,
              }}
            />
          </div>
        </div>
        <div
          className="mt-0.5 flex justify-between text-[10px] tabular-nums"
          style={{ color: hexToRgba(textColor, 0.5) }}
        >
          <span>{formatTime(progress.current)}</span>
          <span>{formatTime(progress.total)}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <button
          type="button"
          onPointerDown={() => {
            if (needsTap) playProfileAudioFromUserGesture();
          }}
          onClick={handleToggle}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 ${
            needsTap ? "animate-pulse" : ""
          }`}
          style={{ background: baseColor }}
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-white" fill="currentColor" />
          ) : (
            <Play className="h-4 w-4 text-white" fill="currentColor" />
          )}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          className="opacity-70 transition-opacity hover:opacity-100"
          style={{ color: textColor }}
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </PlayerShell>
  );
}
