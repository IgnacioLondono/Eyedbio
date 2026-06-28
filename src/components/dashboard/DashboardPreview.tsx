"use client";

import type { Profile } from "@/types/profile";
import ProfileCard from "@/components/profile/ProfileCard";
import BackgroundEffects from "@/components/media/BackgroundEffects";
import BackgroundMedia from "@/components/media/BackgroundMedia";
import ProfilePageOverlay, { ProfileBackgroundDim } from "@/components/profile/ProfilePageOverlay";
import { resolveBackgroundDim, resolvePageOverlay } from "@/lib/profile/profile-overlay-config";
import { resolveProfileDisplay } from "@/lib/profile/profile-display-config";
import { isBackgroundProfileAudio } from "@/lib/profile/profile-audio";
import { useI18n } from "@/components/providers/LocaleProvider";
import { DashboardToggle } from "@/components/dashboard/DashboardUi";

interface Props {
  profile: Profile;
  profileAudioEnabled: boolean;
  simulateEntry: boolean;
  onSimulateEntryChange: (value: boolean) => void;
}

export default function DashboardPreview({
  profile,
  profileAudioEnabled,
  simulateEntry,
  onSimulateEntryChange,
}: Props) {
  const { t, locale } = useI18n();

  return (
    <aside className="lg:sticky lg:top-[4.5rem] lg:self-start w-full max-w-[340px] mx-auto lg:mx-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
            {t("dashboard.preview")}
          </p>
          <p className="mt-0.5 text-[11px] text-white/30">{t("dashboard.previewHint")}</p>
        </div>
      </div>

      <DashboardToggle
        label={t("dashboard.previewSimulateEntry")}
        checked={simulateEntry}
        onChange={onSimulateEntryChange}
      />

      <div className="relative mx-auto mt-4 w-full max-w-[300px]">
        <div className="absolute -inset-3 rounded-[2.75rem] bg-purple-500/10 blur-2xl" aria-hidden />
        <div className="relative rounded-[2.25rem] border-[3px] border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/50">
          <div className="absolute left-1/2 top-3 z-20 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-zinc-950" aria-hidden />
          <div className="relative aspect-[9/16] max-h-[min(640px,72vh)] overflow-hidden rounded-[1.75rem] bg-[#0a0a0f] isolate">
            <BackgroundMedia
              url={profile.settings.backgroundUrl}
              type={profile.backgroundType}
              focus={profile.settings.backgroundFocus}
              contained
              videoAudioEnabled={
                profileAudioEnabled && profile.audioEnabled && isBackgroundProfileAudio(profile)
              }
              deferPlayback={simulateEntry}
            />
            <ProfileBackgroundDim
              dim={resolveBackgroundDim(profile.settings)}
              className="z-[2]"
            />
            <ProfilePageOverlay overlay={resolvePageOverlay(profile.settings)} className="z-[3]" />
            <BackgroundEffects effect={profile.settings.backgroundEffect} contained />
            <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden">
              <div className="pointer-events-none flex min-h-full w-full items-center justify-center px-4 py-6">
                <div className="pointer-events-auto mx-auto w-full max-w-[280px] shrink-0">
                  <ProfileCard
                    key={`${profile.settings.cardLayout}-${profile.settings.linkStyle}`}
                    profile={profile}
                    compact
                  />
                </div>
              </div>
            </div>
            {simulateEntry ? (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-md">
                <span className="text-[10px] lowercase tracking-[0.15em] text-white/75 sm:text-xs">
                  {resolveProfileDisplay(profile.settings, profile.locale ?? locale).entryGateText}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
