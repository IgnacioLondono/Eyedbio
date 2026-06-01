"use client";

import ShareProfileButton from "@/components/ShareProfileButton";
import ProfileAudio from "@/components/ProfileAudio";

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
  return (
    <>
      <ShareProfileButton username={username} displayName={displayName} variant="card" />
      {audioEnabled && audioUrl ? (
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
