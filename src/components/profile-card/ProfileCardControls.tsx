"use client";

import ShareProfileButton from "@/components/ShareProfileButton";
import ProfileAudio from "@/components/ProfileAudio";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

interface Props {
  username: string;
  displayName: string;
  audioUrl?: string;
  audioStartTime?: number;
  audioEnabled?: boolean;
  accentColor?: string;
}

export default function ProfileCardControls({
  username,
  displayName,
  audioUrl,
  audioStartTime,
  audioEnabled,
  accentColor,
}: Props) {
  const site = useSiteSettings();

  return (
    <>
      <ShareProfileButton username={username} displayName={displayName} variant="card" />
      {site.profileAudioEnabled && audioEnabled && audioUrl ? (
        <ProfileAudio
          url={audioUrl}
          startTime={audioStartTime}
          enabled={audioEnabled}
          accentColor={accentColor}
          variant="card"
        />
      ) : null}
    </>
  );
}
