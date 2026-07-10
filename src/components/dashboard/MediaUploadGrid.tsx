"use client";

import type { BackgroundType, Profile } from "@/types/profile";
import type { MediaFocus } from "@/lib/media/media-focus";
import FileUpload from "@/components/media/FileUpload";
import { useI18n } from "@/components/providers/LocaleProvider";

interface Props {
  profile: Profile;
  profileAudioEnabled: boolean;
  onBackgroundUploaded: (url: string, backgroundType?: BackgroundType) => void;
  onBackgroundClear: () => void;
  onBackgroundFocusChange: (focus: MediaFocus) => void;
  onAvatarUploaded: (url: string) => void;
  onAvatarClear: () => void;
  onAvatarFocusChange: (focus: MediaFocus) => void;
  onCursorUploaded: (url: string) => void;
  onCursorClear: () => void;
  onAudioUploaded: (url: string) => void;
  onAudioClear: () => void;
  onConfigureAudio?: () => void;
}

export default function MediaUploadGrid({
  profile,
  profileAudioEnabled,
  onBackgroundUploaded,
  onBackgroundClear,
  onBackgroundFocusChange,
  onAvatarUploaded,
  onAvatarClear,
  onAvatarFocusChange,
  onCursorUploaded,
  onCursorClear,
  onAudioUploaded,
  onAudioClear,
  onConfigureAudio,
}: Props) {
  const { t } = useI18n();
  const hasAudio = Boolean(profile.audioUrl) || profile.audioSource === "background";
  const hasCustomAvatar =
    Boolean(profile.avatarUrl) && !profile.avatarUrl.includes("dicebear.com");

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-white">{t("dashboard.fileUploader")}</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FileUpload
          kind="background"
          layout="card"
          label={t("dashboard.uploadCardBackground")}
          currentUrl={profile.settings.backgroundUrl}
          mediaType={profile.backgroundType}
          mediaFocus={profile.settings.backgroundFocus}
          onMediaFocusChange={onBackgroundFocusChange}
          onUploaded={onBackgroundUploaded}
          onClear={onBackgroundClear}
        />

        {profileAudioEnabled ? (
          <div className="flex h-full flex-col">
            <FileUpload
              kind="audio"
              layout="card"
              label={t("dashboard.uploadCardAudio")}
              currentUrl={profile.audioSource === "background" ? undefined : profile.audioUrl}
              onUploaded={onAudioUploaded}
              onClear={onAudioClear}
            />
            {hasAudio && onConfigureAudio ? (
              <button
                type="button"
                onClick={onConfigureAudio}
                className="mt-1.5 w-full text-center text-[10px] text-purple-400/90 transition-colors hover:text-purple-300"
              >
                {t("dashboard.audioConfigureLink")}
              </button>
            ) : null}
          </div>
        ) : null}

        <FileUpload
          kind="avatar"
          layout="card"
          label={t("dashboard.uploadCardAvatar")}
          currentUrl={hasCustomAvatar ? profile.avatarUrl : undefined}
          mediaFocus={profile.settings.avatarFocus}
          onMediaFocusChange={onAvatarFocusChange}
          onUploaded={onAvatarUploaded}
          onClear={onAvatarClear}
        />

        <FileUpload
          kind="cursor"
          layout="card"
          label={t("dashboard.uploadCardCursor")}
          currentUrl={profile.settings.cursorUrl}
          onUploaded={onCursorUploaded}
          onClear={onCursorClear}
        />
      </div>
    </section>
  );
}
