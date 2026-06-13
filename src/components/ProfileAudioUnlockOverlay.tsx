"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Volume2 } from "lucide-react";
import { useI18n } from "@/components/LocaleProvider";
import {
  bindProfileAudioAutoplayEvents,
  configureProfileAudioEngine,
  getProfileAudioEngineSnapshot,
  playProfileAudioFromUserGesture,
  subscribeProfileAudioEngine,
} from "@/lib/profile-audio-engine";
import { DEFAULT_CLIP_DURATION } from "@/lib/audio-config";

interface Props {
  url: string;
  startTime?: number;
  clipDuration?: number;
  enabled: boolean;
}

export default function ProfileAudioUnlockOverlay({
  url,
  startTime = 0,
  clipDuration = DEFAULT_CLIP_DURATION,
  enabled,
}: Props) {
  const { t } = useI18n();
  const snapshot = useSyncExternalStore(
    subscribeProfileAudioEngine,
    getProfileAudioEngineSnapshot,
    getProfileAudioEngineSnapshot
  );

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || !url) return;

    configureProfileAudioEngine({
      src: url,
      startTime,
      clipDuration,
      enabled,
    });

    const unbind = bindProfileAudioAutoplayEvents();

    return () => {
      unbind();
    };
  }, [clipDuration, enabled, startTime, url]);

  useEffect(() => {
    if (snapshot.awaitingUnlock && snapshot.volume > 0 && !snapshot.userPaused) {
      setVisible(true);
      return;
    }
    if (snapshot.isPlaying && !snapshot.awaitingUnlock) {
      setVisible(false);
    }
  }, [snapshot.awaitingUnlock, snapshot.isPlaying, snapshot.userPaused, snapshot.volume]);

  const unlock = useCallback(() => {
    const ok = playProfileAudioFromUserGesture();
    if (ok) {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !visible) return;

    const onGesture = () => {
      unlock();
    };

    document.addEventListener("pointerdown", onGesture, { capture: true });
    document.addEventListener("touchstart", onGesture, { capture: true, passive: true });
    document.addEventListener("keydown", onGesture, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", onGesture, { capture: true });
      document.removeEventListener("touchstart", onGesture, { capture: true });
      document.removeEventListener("keydown", onGesture, { capture: true });
    };
  }, [enabled, unlock, visible]);

  if (!enabled || !url || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center pb-28 sm:pb-24 px-6 pointer-events-none"
      aria-live="polite"
    >
      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault();
          unlock();
        }}
        className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-white/15 bg-black/70 px-5 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md animate-pulse hover:bg-black/80 transition-colors"
      >
        <Volume2 className="h-4 w-4 shrink-0 text-purple-300" aria-hidden />
        {t("profile.tapForSound")}
      </button>
    </div>
  );
}
