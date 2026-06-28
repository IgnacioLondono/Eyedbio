"use client";

import ShareProfileButton from "@/components/profile/ShareProfileButton";
import ProfileAudio from "@/components/profile/ProfileAudio";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";

interface Props {
  username: string;
  displayName: string;
  playbackUrl?: string;
  audioStartTime?: number;
  audioClipDuration?: number;
  volumeOnly?: boolean;
  audioEnabled?: boolean;
  accentColor?: string;
  showShareButton?: boolean;
  mediaActive?: boolean;
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
  showShareButton = true,
  mediaActive = true,
}: Props) {
  const site = useSiteSettings();

  return (
    <>
      {showShareButton ? (
        <ShareProfileButton username={username} displayName={displayName} variant="card" />
      ) : null}
      {site.profileAudioEnabled && audioEnabled && playbackUrl && mediaActive ? (
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
