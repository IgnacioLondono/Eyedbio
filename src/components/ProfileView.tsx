"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Profile } from "@/types/profile";
import { isLockedPublicProfile, LockedPublicProfile } from "@/types/public-profile";
import BackgroundEffects from "@/components/BackgroundEffects";
import BackgroundMedia from "@/components/BackgroundMedia";
import ProfileCard from "@/components/ProfileCard";
import ClaimProfileCta from "@/components/ClaimProfileCta";
import ProfileQuickNavButton from "@/components/ProfileQuickNavButton";
import ProfileAccessGate from "@/components/ProfileAccessGate";
import { profileUnlockRequestHeaders } from "@/lib/profile-unlock-client";
import { useI18n } from "@/components/LocaleProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { t as translate, tVars as translateVars } from "@/lib/i18n";
import type { AppLocale } from "@/lib/i18n/types";

interface Props {
  username: string;
}

export default function ProfileView({ username }: Props) {
  const { locale: uiLocale } = useI18n();
  const { status } = useSession();
  const site = useSiteSettings();
  const reserveBottomForCta =
    site.claimProfileCtaEnabled && status === "unauthenticated";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lockedProfile, setLockedProfile] = useState<LockedPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

      setProfile(data as Profile);
      await recordView();
    } catch {
      setLoadError(translate(uiLocale, "profile.connectionError"));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username, recordView, uiLocale]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (profile) {
      document.title = `${profile.displayName} (@${profile.username}) — Eyed.bio`;
      return;
    }
    if (lockedProfile) {
      document.title = `${lockedProfile.displayName} (@${lockedProfile.username}) — Eyed.bio`;
      return;
    }
    if (!loading && !loadError) {
      document.title = t("profile.pageTitleNotFound");
    }
  }, [profile, lockedProfile, loading, loadError, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (lockedProfile) {
    return (
      <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0a0a0f]">
        <ProfileQuickNavButton profileUsername={lockedProfile.username} />
        <ClaimProfileCta />
        <ProfileAccessGate profile={lockedProfile} onUnlocked={loadProfile} />
      </div>
    );
  }

  if (!profile) {
    if (loadError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white px-6 text-center">
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
      );
    }

    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white px-6">
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
    );
  }

  const { settings } = profile;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0a0a0f]">
      <BackgroundMedia
        url={settings.backgroundUrl}
        type={profile.backgroundType}
        focus={settings.backgroundFocus}
      />
      <div className="fixed inset-0 z-[1] bg-black/50 pointer-events-none" />
      <BackgroundEffects effect={settings.backgroundEffect} />
      <ProfileQuickNavButton profileUsername={profile.username} />
      <ClaimProfileCta />
      <div
        className={`relative z-20 flex min-h-[100dvh] w-full items-center justify-center px-6 py-6 ${
          reserveBottomForCta ? "pb-28" : ""
        }`}
      >
        <div className="mx-auto w-full max-w-md flex justify-center">
          <ProfileCard profile={profile} showControls />
        </div>
      </div>
    </div>
  );
}
