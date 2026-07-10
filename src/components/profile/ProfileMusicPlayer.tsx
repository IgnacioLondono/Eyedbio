"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play, Volume2, VolumeX, Music } from "lucide-react";
import type { Profile } from "@/types/profile";
import { hexToRgba } from "@/lib/config/color-utils";
import { getMediaSrc } from "@/lib/media/media-url";
import { FocusedImage } from "@/components/media/FocusedMedia";
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
  /** Vista previa/estática (dashboard): sin control real del audio. */
  compact?: boolean;
  /** Posiciona dentro del contenedor padre (preview) en vez del viewport. */
  contained?: boolean;
  /** Sube el reproductor para no chocar con el CTA de reclamar perfil. */
  raised?: boolean;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ProfileMusicPlayer({
  profile,
  compact = false,
  contained = false,
  raised = false,
}: Props) {
  const site = useSiteSettings();
  const enabled =
    isMusicPlayerEnabled(profile.settings) && profile.audioSource !== "background";
  const interactive = !compact && site.profileAudioEnabled && isMusicPlayerPlayable(profile);

  if (!enabled) return null;
  if (!compact && !interactive) return null;

  const positionClass = contained
    ? "absolute bottom-3 left-1/2 z-30 w-[calc(100%-1.5rem)] max-w-[260px] -translate-x-1/2"
    : `fixed left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 ${
        raised ? "bottom-[11.5rem] md:bottom-[12.5rem]" : "bottom-4"
      }`;

  return (
    <div className={`${positionClass} pointer-events-auto`}>
      {interactive ? (
        <InteractiveMusicPlayer profile={profile} />
      ) : (
        <StaticMusicPlayer profile={profile} />
      )}
    </div>
  );
}

function PlayerShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const { baseColor, blur } = resolveMusicPlayer(profile);
  return (
    <div
      className="w-full rounded-2xl border bg-black/50 p-3 shadow-xl shadow-black/40"
      style={{
        borderColor: hexToRgba(baseColor, 0.3),
        backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
        WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
}

function Cover({ profile, size = 44 }: { profile: Profile; size?: number }) {
  const { baseColor, title } = resolveMusicPlayer(profile);
  const candidates = [
    profile.settings.musicPlayerCoverUrl?.trim(),
    profile.avatarUrl?.trim(),
  ].filter((url): url is string => Boolean(url));
  const [idx, setIdx] = useState(0);
  const current = candidates[idx];
  const src = current ? getMediaSrc(current) : "";

  if (!src) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-xl"
        style={{ width: size, height: size, background: hexToRgba(baseColor, 0.3) }}
      >
        <Music className="h-5 w-5" style={{ color: baseColor }} />
      </div>
    );
  }

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl"
      style={{ width: size, height: size }}
    >
      <FocusedImage
        key={src}
        src={src}
        alt={title}
        onError={() => setIdx((i) => i + 1)}
      />
    </div>
  );
}

function PlayerTexts({ profile }: { profile: Profile }) {
  const { title, artist, textColor } = resolveMusicPlayer(profile);
  return (
    <div className="min-w-0 flex-1 text-center">
      <p className="truncate text-sm font-semibold" style={{ color: textColor }}>
        {title}
      </p>
      <p className="truncate text-xs" style={{ color: hexToRgba(textColor, 0.6) }}>
        {artist}
      </p>
    </div>
  );
}

function StaticMusicPlayer({ profile }: { profile: Profile }) {
  const { baseColor, textColor } = resolveMusicPlayer(profile);
  return (
    <PlayerShell profile={profile}>
      <div className="flex items-center gap-3">
        <Cover profile={profile} />
        <PlayerTexts profile={profile} />
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: baseColor }}
        >
          <Play className="h-4 w-4 text-white" fill="currentColor" />
        </div>
      </div>
      <div
        className="mt-2.5 h-1 w-full overflow-hidden rounded-full"
        style={{ background: hexToRgba(textColor, 0.18) }}
      >
        <div className="h-full rounded-full" style={{ width: "35%", background: baseColor }} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Volume2 className="h-3.5 w-3.5 shrink-0" style={{ color: hexToRgba(textColor, 0.6) }} />
        <div
          className="h-1 flex-1 overflow-hidden rounded-full"
          style={{ background: hexToRgba(textColor, 0.18) }}
        >
          <div className="h-full rounded-full" style={{ width: "70%", background: baseColor }} />
        </div>
      </div>
    </PlayerShell>
  );
}

function InteractiveMusicPlayer({ profile }: { profile: Profile }) {
  const { baseColor, textColor } = resolveMusicPlayer(profile);
  const snapshot = useSyncExternalStore(
    subscribeProfileAudioEngine,
    getProfileAudioEngineSnapshot,
    getProfileAudioEngineServerSnapshot
  );

  const [progress, setProgress] = useState({ progress: 0, current: 0, total: 0 });
  const rafRef = useRef<number | null>(null);

  const volume = snapshot.volume;
  const isPlaying = snapshot.isPlaying;
  const muted = volume === 0;
  const needsTap = snapshot.needsTap || snapshot.awaitingUnlock;

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

  return (
    <PlayerShell profile={profile}>
      <div className="flex items-center gap-3">
        <Cover profile={profile} />
        <PlayerTexts profile={profile} />
        <button
          type="button"
          onPointerDown={() => {
            if (needsTap) playProfileAudioFromUserGesture();
          }}
          onClick={handleToggle}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 ${
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
      </div>

      <div
        className="mt-2.5 cursor-pointer py-1"
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
        className="flex justify-between text-[10px] tabular-nums"
        style={{ color: hexToRgba(textColor, 0.5) }}
      >
        <span>{formatTime(progress.current)}</span>
        <span>{formatTime(progress.total)}</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setProfileAudioVolume(muted ? 0.7 : 0)}
          className="shrink-0 transition-opacity hover:opacity-80"
          style={{ color: hexToRgba(textColor, 0.7) }}
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setProfileAudioVolume(parseFloat(e.target.value))}
          className="h-1 flex-1 cursor-pointer"
          style={{ accentColor: baseColor }}
          aria-label="Volumen"
        />
      </div>
    </PlayerShell>
  );
}
