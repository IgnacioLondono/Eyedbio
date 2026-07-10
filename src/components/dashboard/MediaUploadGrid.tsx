"use client";

import type { BackgroundType, Profile } from "@/types/profile";
import type { MediaFocus } from "@/lib/media/media-focus";
import FileUpload from "@/components/media/FileUpload";
import { Music } from "lucide-react";
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
  onOpenAudio: () => void;
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
  onOpenAudio,
}: Props) {
  const { t } = useI18n();
  const hasAudio = Boolean(profile.audioUrl) || profile.audioSource === "background";

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{t("dashboard.fileUploader")}</h2>
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
          <div className="flex h-full flex-col rounded-xl border border-white/[0.08] bg-[#12121a] p-3">
            <p className="mb-3 text-sm font-medium text-white/90">{t("dashboard.uploadCardAudio")}</p>
            <div className="flex min-h-[140px] flex-1 flex-col">
              {hasAudio ? (
                <button
                  type="button"
                  onClick={onOpenAudio}
                  className="relative flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-white/50 transition-colors hover:border-purple-500/30 hover:bg-purple-500/5"
                >
                  <Music className="h-6 w-6 text-purple-400" />
                  <span>{t("fileUpload.audioUploaded")}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAudio}
                  className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 text-xs text-white/40 transition-colors hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-white/70"
                >
                  <span className="px-3 text-center leading-snug">
                    {t("dashboard.uploadCardClickAudio")}
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : null}

        <FileUpload
          kind="avatar"
          layout="card"
          label={t("dashboard.uploadCardAvatar")}
          currentUrl={profile.avatarUrl}
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
