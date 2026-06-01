"use client";

import { useCallback, useEffect, useState } from "react";
import { Profile } from "@/types/profile";
import { isLockedPublicProfile, LockedPublicProfile } from "@/types/public-profile";
import BackgroundEffects from "@/components/BackgroundEffects";
import BackgroundMedia from "@/components/BackgroundMedia";
import ProfileAudio from "@/components/ProfileAudio";
import ProfileCard from "@/components/ProfileCard";
import ShareProfileButton from "@/components/ShareProfileButton";
import ClaimProfileCta from "@/components/ClaimProfileCta";
import ProfileQuickNavButton from "@/components/ProfileQuickNavButton";
import ProfileAccessGate from "@/components/ProfileAccessGate";

interface Props {
  username: string;
}

export default function ProfileView({ username }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lockedProfile, setLockedProfile] = useState<LockedPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const recordView = useCallback(async () => {
    await fetch(`/api/profile/${username}/view`, { method: "POST" });
  }, [username]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLockedProfile(null);
    setProfile(null);

    try {
      const res = await fetch(`/api/profile/${username}`);
      if (!res.ok) {
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
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username, recordView]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

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
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white px-6">
        <h1 className="text-6xl font-bold text-white/10 mb-4">404</h1>
        <p className="text-white/50 mb-6">Este perfil no existe</p>
        <a
          href="/signup"
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
        >
          Crear mi perfil
        </a>
      </div>
    );
  }

  const { settings } = profile;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0a0a0f]">
      <BackgroundMedia url={settings.backgroundUrl} type={profile.backgroundType} />
      <div className="fixed inset-0 z-[1] bg-black/50 pointer-events-none" />
      <BackgroundEffects effect={settings.backgroundEffect} />
      <ProfileAudio
        url={profile.audioUrl ?? ""}
        startTime={profile.audioStartTime}
        enabled={profile.audioEnabled}
        accentColor={settings.accentColor}
      />
      <ShareProfileButton
        username={profile.username}
        displayName={profile.displayName}
      />
      <ProfileQuickNavButton profileUsername={profile.username} />
      <ClaimProfileCta />
      <div className="relative z-20 flex min-h-[100dvh] w-full items-center justify-center p-6 pb-28">
        <ProfileCard profile={profile} />
      </div>
    </div>
  );
}
