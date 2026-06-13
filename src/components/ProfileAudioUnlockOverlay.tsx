"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { Volume2 } from "lucide-react";
import { useI18n } from "@/components/LocaleProvider";
import {
  getProfileAudioEngineSnapshot,
  getProfileAudioEngineServerSnapshot,
  subscribeProfileAudioEngine,
  unlockProfileAudioIfNeeded,
} from "@/lib/profile-audio-engine";

interface Props {
  enabled: boolean;
}

export default function ProfileAudioUnlockOverlay({ enabled }: Props) {
  const { t } = useI18n();
  const snapshot = useSyncExternalStore(
    subscribeProfileAudioEngine,
    getProfileAudioEngineSnapshot,
    getProfileAudioEngineServerSnapshot
  );

  const unlock = useCallback(() => {
    unlockProfileAudioIfNeeded();
  }, []);

  useEffect(() => {
    if (!enabled || !snapshot.needsTap) return;

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
  }, [enabled, snapshot.needsTap, unlock]);

  if (!enabled || !snapshot.needsTap) return null;

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
