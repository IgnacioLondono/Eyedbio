"use client";

import { useEffect, useState } from "react";
import { Profile } from "@/types/profile";
import BackgroundEffects from "@/components/BackgroundEffects";
import BackgroundMedia from "@/components/BackgroundMedia";
import ProfileAudio from "@/components/ProfileAudio";
import ProfileCard from "@/components/ProfileCard";
import ShareProfileButton from "@/components/ShareProfileButton";
import ClaimProfileCta from "@/components/ClaimProfileCta";
import ProfileQuickNavButton from "@/components/ProfileQuickNavButton";

interface Props {
  username: string;
}

export default function ProfileView({ username }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/profile/${username}`);
        if (!res.ok) {
          if (!cancelled) setProfile(null);
          return;
        }

        const data = (await res.json()) as Profile;
        if (!cancelled) setProfile(data);

        await fetch(`/api/profile/${username}/view`, { method: "POST" });
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
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
