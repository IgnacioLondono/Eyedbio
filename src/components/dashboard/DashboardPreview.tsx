"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
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

type PreviewMode = "mobile" | "desktop";

interface Props {
  profile: Profile;
  profileAudioEnabled: boolean;
  simulateEntry: boolean;
  onSimulateEntryChange: (value: boolean) => void;
  onPreviewModeChange?: (mode: PreviewMode) => void;
}

function PreviewSurface({
  profile,
  profileAudioEnabled,
  simulateEntry,
  compact,
  desktop,
}: {
  profile: Profile;
  profileAudioEnabled: boolean;
  simulateEntry: boolean;
  compact: boolean;
  desktop?: boolean;
}) {
  const { locale } = useI18n();

  return (
    <>
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
      <ProfileBackgroundDim dim={resolveBackgroundDim(profile.settings)} className="z-[2]" />
      <ProfilePageOverlay overlay={resolvePageOverlay(profile.settings)} className="z-[3]" />
      <BackgroundEffects effect={profile.settings.backgroundEffect} contained />
      <div className="absolute inset-0 z-10 overflow-hidden">
        <div
          className={`pointer-events-none flex h-full w-full items-center justify-center overflow-y-auto overscroll-none ${
            desktop ? "px-5 py-5" : "px-4 py-6"
          } [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          <div
            className={`pointer-events-auto mx-auto w-full shrink-0 ${
              compact ? "max-w-[280px]" : "max-w-md"
            }`}
          >
            <ProfileCard
              key={`${profile.settings.cardLayout}-${profile.settings.linkStyle}-${compact ? "m" : "d"}`}
              profile={profile}
              compact={compact}
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
    </>
  );
}

export default function DashboardPreview({
  profile,
  profileAudioEnabled,
  simulateEntry,
  onSimulateEntryChange,
  onPreviewModeChange,
}: Props) {
  const { t } = useI18n();
  const [previewMode, setPreviewMode] = useState<PreviewMode>("mobile");
  const isMobile = previewMode === "mobile";

  const setMode = (mode: PreviewMode) => {
    setPreviewMode(mode);
    onPreviewModeChange?.(mode);
  };

  return (
    <aside
      className={`lg:sticky lg:top-[4.5rem] lg:self-start w-full mx-auto lg:mx-0 transition-[max-width] duration-300 ${
        isMobile ? "max-w-[340px]" : "max-w-[420px]"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
            {t("dashboard.preview")}
          </p>
          <p className="mt-0.5 text-[11px] text-white/30">
            {isMobile ? t("dashboard.previewHintMobile") : t("dashboard.previewHintDesktop")}
          </p>
        </div>
        <div
          className="flex shrink-0 rounded-lg border border-white/10 bg-white/[0.03] p-0.5"
          role="group"
          aria-label={t("dashboard.previewModeLabel")}
        >
          <button
            type="button"
            onClick={() => setMode("mobile")}
            aria-pressed={isMobile}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
              isMobile
                ? "bg-purple-500/20 text-purple-200"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            {t("dashboard.previewModeMobile")}
          </button>
          <button
            type="button"
            onClick={() => setMode("desktop")}
            aria-pressed={!isMobile}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
              !isMobile
                ? "bg-purple-500/20 text-purple-200"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            {t("dashboard.previewModeDesktop")}
          </button>
        </div>
      </div>

      <DashboardToggle
        label={t("dashboard.previewSimulateEntry")}
        checked={simulateEntry}
        onChange={onSimulateEntryChange}
      />

      {isMobile ? (
        <div className="relative mx-auto mt-4 w-full max-w-[300px]">
          <div className="absolute -inset-3 rounded-[2.75rem] bg-purple-500/10 blur-2xl" aria-hidden />
          <div className="relative rounded-[2.25rem] border-[3px] border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/50">
            <div
              className="absolute left-1/2 top-3 z-20 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-zinc-950"
              aria-hidden
            />
            <div className="relative aspect-[9/16] max-h-[min(640px,72vh)] overflow-hidden rounded-[1.75rem] bg-[#0a0a0f] isolate">
              <PreviewSurface
                profile={profile}
                profileAudioEnabled={profileAudioEnabled}
                simulateEntry={simulateEntry}
                compact
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mx-auto mt-4 w-full">
          <div className="overflow-hidden rounded-xl border border-zinc-700/70 bg-zinc-950 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-1.5 border-b border-white/5 bg-zinc-900/95 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500/70" aria-hidden />
              <span className="h-2 w-2 rounded-full bg-amber-500/70" aria-hidden />
              <span className="h-2 w-2 rounded-full bg-emerald-500/70" aria-hidden />
              <span className="ml-1.5 min-w-0 flex-1 truncate rounded bg-white/[0.05] px-2 py-0.5 text-[9px] text-white/30">
                eyedbio.eyedcomun.me/{profile.username}
              </span>
            </div>
            <div className="relative h-[min(560px,calc(100vh-13rem))] min-h-[480px] w-full overflow-hidden bg-[#0a0a0f] isolate">
              <PreviewSurface
                profile={profile}
                profileAudioEnabled={profileAudioEnabled}
                simulateEntry={simulateEntry}
                compact={false}
                desktop
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
