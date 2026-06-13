"use client";

import ShareProfileButton from "@/components/ShareProfileButton";
import ProfileAudio from "@/components/ProfileAudio";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

interface Props {
  username: string;
  displayName: string;
  playbackUrl?: string;
  audioStartTime?: number;
  audioClipDuration?: number;
  volumeOnly?: boolean;
  audioEnabled?: boolean;
  accentColor?: string;
}

export default function ProfileCardControls({
  username,
  displayName,
  playbackUrl,
  audioStartTime,
  audioClipDuration,
  volumeOnly = false,
  audioEnabled,
  accentColor,
}: Props) {
  const site = useSiteSettings();

  return (
    <>
      <ShareProfileButton username={username} displayName={displayName} variant="card" />
      {site.profileAudioEnabled && audioEnabled && playbackUrl ? (
        <ProfileAudio
          url={playbackUrl}
          startTime={audioStartTime}
          clipDuration={audioClipDuration}
          volumeOnly={volumeOnly}
          enabled={audioEnabled}
          accentColor={accentColor}
          variant="card"
        />
      ) : null}
    </>
  );
}
