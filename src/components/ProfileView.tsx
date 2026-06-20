"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Profile } from "@/types/profile";
import { isLockedPublicProfile, LockedPublicProfile } from "@/types/public-profile";
import BackgroundEffects from "@/components/BackgroundEffects";
import BackgroundMedia from "@/components/BackgroundMedia";
import ProfileCard from "@/components/ProfileCard";
import ClaimProfileCta from "@/components/ClaimProfileCta";
import ProfileQuickNavButton from "@/components/ProfileQuickNavButton";
import ProfileAccessGate from "@/components/ProfileAccessGate";
import ProfileEntryGate from "@/components/ProfileEntryGate";
import ProfileTabIcon from "@/components/ProfileTabIcon";
import { profileUnlockRequestHeaders } from "@/lib/profile-unlock-client";
import { preloadBackgroundMedia } from "@/lib/media-url";
import { isBackgroundProfileAudio } from "@/lib/profile-audio";
import { getProfileDocumentTitle, resolveProfileDisplay } from "@/lib/profile-display-config";
import { resolveProfileTabIconUrl } from "@/lib/profile-tab-icon";
import { enterProfileFromGesture } from "@/lib/profile-enter";
import { resetBackgroundVideoAudioState } from "@/lib/profile-background-video-audio";
import ProfilePageOverlay, { ProfileBackgroundDim } from "@/components/ProfilePageOverlay";
import { resolveBackgroundDim, resolvePageOverlay } from "@/lib/profile-overlay-config";
import { PROFILE_VIEW_ROOT_ATTR, teardownProfilePresentation } from "@/lib/profile-teardown";
import { pathsMatchRoute, useBrowserPathname } from "@/lib/use-browser-pathname";
import { useI18n } from "@/components/LocaleProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { t as translate, tVars as translateVars } from "@/lib/i18n";
import type { AppLocale } from "@/lib/i18n/types";

interface Props {
  username: string;
  viewerIsOwner?: boolean;
}

export default function ProfileView({ username, viewerIsOwner }: Props) {
  const browserPathname = useBrowserPathname();
  const profilePath = `/${username.toLowerCase()}`;
  const isActiveRoute = pathsMatchRoute(browserPathname, profilePath);

  const { locale: uiLocale } = useI18n();
  const { status } = useSession();
  const site = useSiteSettings();
  const reserveBottomForCta =
    site.claimProfileCtaEnabled && status === "unauthenticated";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lockedProfile, setLockedProfile] = useState<LockedPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const viewPendingRef = useRef(false);
  const enterAudioPendingRef = useRef(false);

  const locale: AppLocale = profile?.locale ?? uiLocale;
  const t = (path: string) => translate(locale, path);
  const tV = (path: string, vars: Record<string, string | number>) =>
    translateVars(locale, path, vars);

  const recordView = useCallback(async () => {
    await fetch(`/api/profile/${username}/view`, { method: "POST" });
  }, [username]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLockedProfile(null);
    setProfile(null);
    setLoadError(null);
    setEntered(false);
    viewPendingRef.current = false;
    resetBackgroundVideoAudioState();

    try {
      const res = await fetch(`/api/profile/${username}`, {
        credentials: "same-origin",
        headers: profileUnlockRequestHeaders(username),
      });
      if (res.status === 404) {
        setProfile(null);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoadError(
          typeof data.error === "string" ? data.error : translate(uiLocale, "profile.loadError")
        );
        setProfile(null);
        return;
      }

      const data = await res.json();

      if (isLockedPublicProfile(data)) {
        setLockedProfile(data);
        return;
      }

      const nextProfile = data as Profile;
      setProfile(nextProfile);
      setLoading(false);
      preloadBackgroundMedia(
        nextProfile.settings.backgroundUrl,
        nextProfile.backgroundType,
        true
      );

      viewPendingRef.current = true;
      return;
    } catch {
      setLoadError(translate(uiLocale, "profile.connectionError"));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username, uiLocale]);

  useEffect(() => {
    if (!isActiveRoute) return;
    void loadProfile();
    return () => teardownProfilePresentation();
  }, [loadProfile, isActiveRoute]);

  useEffect(() => {
    if (!isActiveRoute) {
      teardownProfilePresentation();
    }
  }, [isActiveRoute]);

  useEffect(() => () => teardownProfilePresentation(), []);

  useEffect(() => {
    if (!isActiveRoute || !profile) return;
    document.title = getProfileDocumentTitle(profile);
  }, [isActiveRoute, profile]);

  useEffect(() => {
    if (!isActiveRoute || !lockedProfile) return;
    document.title = `${lockedProfile.displayName} (@${lockedProfile.username}) — Eyed.bio`;
  }, [isActiveRoute, lockedProfile]);

  useEffect(() => {
    if (!isActiveRoute || loading || loadError || profile || lockedProfile) return;
    document.title = t("profile.pageTitleNotFound");
  }, [isActiveRoute, loading, loadError, profile, lockedProfile, t]);

  useEffect(() => {
    setEntered(false);
  }, [username]);

  const handleEnter = useCallback(() => {
    if (!profile || entered) return;
    enterAudioPendingRef.current = true;
    setEntered(true);
    if (viewPendingRef.current) {
      viewPendingRef.current = false;
      void recordView();
    }
  }, [profile, entered, recordView]);

  useEffect(() => {
    if (!entered || !profile || !enterAudioPendingRef.current) return;
    enterAudioPendingRef.current = false;

    const frame = requestAnimationFrame(() => {
      enterProfileFromGesture(profile);
    });

    return () => cancelAnimationFrame(frame);
  }, [entered, profile]);

  if (!isActiveRoute) {
    return null;
  }

  const shellProps = {
    [PROFILE_VIEW_ROOT_ATTR]: username,
    className:
      "fixed inset-0 z-40 overflow-hidden bg-[#0a0a0f] isolate [transform:translateZ(0)]",
  };

  if (loading) {
    return (
      <div {...shellProps}>
        <div className="flex min-h-[100dvh] items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (lockedProfile) {
    return (
      <div {...shellProps}>
        <div className="relative h-[100dvh] w-full overflow-hidden">
          <ProfileQuickNavButton
            profileUsername={lockedProfile.username}
            viewerIsOwner={viewerIsOwner}
          />
          <ClaimProfileCta />
          <ProfileAccessGate profile={lockedProfile} onUnlocked={loadProfile} />
        </div>
      </div>
    );
  }

  if (!profile) {
    if (loadError) {
      return (
        <div {...shellProps}>
          <div className="flex min-h-[100dvh] flex-col items-center justify-center text-white px-6 text-center">
            <p className="text-white/70 mb-2">{t("profile.loadError")}</p>
            <p className="text-white/45 text-sm mb-6 max-w-sm">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadProfile()}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div {...shellProps}>
        <div className="flex min-h-[100dvh] flex-col items-center justify-center text-white px-6">
          <h1 className="text-6xl font-bold text-white/10 mb-4">404</h1>
          <p className="text-white/50 mb-2">{t("profile.notFoundTitle")}</p>
          <p className="text-white/35 text-sm mb-6">
            {tV("profile.notFoundHint", { username: username.toLowerCase() })}
          </p>
          <a
            href="/signup"
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
          >
            {t("profile.createProfile")}
          </a>
        </div>
      </div>
    );
  }

  const { settings } = profile;
  const display = resolveProfileDisplay(settings, profile.locale);
  const pageOverlay = resolvePageOverlay(settings);
  const backgroundDim = resolveBackgroundDim(settings);
  const backgroundVideoAudio =
    site.profileAudioEnabled &&
    profile.audioEnabled &&
    isBackgroundProfileAudio(profile);
  const needsGate = !entered;
  const mediaActive = entered;

  return (
    <div {...shellProps}>
      <div className="relative h-[100dvh] w-full overflow-hidden">
        <ProfileTabIcon iconUrl={resolveProfileTabIconUrl(profile)} />
        <BackgroundMedia
          url={settings.backgroundUrl}
          type={profile.backgroundType}
          focus={settings.backgroundFocus}
          videoAudioEnabled={backgroundVideoAudio}
          deferPlayback={needsGate}
          contained
        />
        <ProfileBackgroundDim dim={backgroundDim} className="z-[1]" />
        <ProfilePageOverlay overlay={pageOverlay} />
        <BackgroundEffects effect={settings.backgroundEffect} contained />
        <ProfileQuickNavButton
          profileUsername={profile.username}
          viewerIsOwner={viewerIsOwner}
        />
        <ClaimProfileCta />
        <div
          className={`absolute inset-0 z-20 flex items-center justify-center overflow-y-auto px-6 py-6 ${
            reserveBottomForCta ? "pb-28" : ""
          } ${needsGate ? "pointer-events-none" : ""}`}
        >
          <div className="mx-auto w-full max-w-md flex justify-center">
            <ProfileCard profile={profile} showControls={mediaActive} mediaActive={mediaActive} />
          </div>
        </div>
        {needsGate ? (
          <ProfileEntryGate text={display.entryGateText} onEnter={handleEnter} />
        ) : null}
      </div>
    </div>
  );
}
