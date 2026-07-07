"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Loader2,
  X,
  ImageIcon,
  Film,
  Image as ImageLucide,
  Music,
  Crop,
} from "lucide-react";
import { BackgroundType } from "@/types/profile";
import { ACCEPT_ATTR, UploadKind, getUploadLimitMb, getUploadValidationError, resolveBackgroundType } from "@/lib/media/media-config";
import { getMediaSrc } from "@/lib/media/media-url";
import {
  IMAGE_ADJUST_PRESETS,
  isAdjustableMediaFile,
  isAdjustableMediaUrl,
  isAdjustableUploadKind,
} from "@/lib/config/image-adjust-config";
import ImageAdjustModal from "@/components/media/ImageAdjustModal";
import { DEFAULT_MEDIA_FOCUS, type MediaFocus } from "@/lib/media/media-focus";
import { FocusedImage, FocusedVideo } from "@/components/media/FocusedMedia";
import { useI18n } from "@/components/providers/LocaleProvider";

interface Props {
  kind: UploadKind;
  label: string;
  hint?: string;
  currentUrl?: string;
  mediaType?: BackgroundType;
  mediaFocus?: MediaFocus;
  onMediaFocusChange?: (focus: MediaFocus) => void;
  accept?: string;
  onUploaded: (url: string, backgroundType?: BackgroundType) => void;
  onClear?: () => void;
}

function resolveBackgroundMediaType(
  url: string,
  mediaType?: BackgroundType
): BackgroundType {
  return resolveBackgroundType(url, mediaType);
}

function MediaTypeBadge({ type }: { type: BackgroundType }) {
  const { t } = useI18n();
  const labels: Record<BackgroundType, string> = {
    image: t("fileUpload.image"),
    gif: t("fileUpload.gif"),
    video: t("fileUpload.video"),
  };

  const icons: Record<BackgroundType, typeof ImageLucide> = {
    image: ImageLucide,
    gif: ImageLucide,
    video: Film,
  };

  const Icon = icons[type];

  return (
    <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium">
      <Icon className="w-3 h-3" />
      {labels[type]}
    </span>
  );
}

function MediaPreview({
  kind,
  currentUrl,
  mediaType,
  mediaFocus,
}: {
  kind: UploadKind;
  currentUrl: string;
  mediaType?: BackgroundType;
  mediaFocus?: MediaFocus;
}) {
  const { t } = useI18n();
  const [broken, setBroken] = useState(false);
  const resolvedType = resolveBackgroundMediaType(currentUrl, mediaType);
  const isVideo = resolvedType === "video";
  const displayUrl = getMediaSrc(currentUrl);

  useEffect(() => {
    setBroken(false);
  }, [currentUrl]);

  if (kind === "avatar") {
    if (broken) {
      return (
        <div className="w-20 h-20 mx-auto my-3 rounded-full bg-white/5 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-white/30" />
        </div>
      );
    }
    return (
      <div className="w-20 h-20 mx-auto my-3">
        <FocusedImage
          src={displayUrl}
          alt={t("fileUpload.avatarAlt")}
          focus={mediaFocus}
          wrapperClassName="h-full w-full rounded-full"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  if (kind === "banner") {
    if (broken) {
      return (
        <div className="h-24 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-white/30" />
        </div>
      );
    }
    return (
      <div className="relative h-24 overflow-hidden">
        <FocusedImage
          src={displayUrl}
          alt={t("fileUpload.bannerAlt")}
          focus={mediaFocus}
          priority
          wrapperClassName="absolute inset-0"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  if (kind === "background") {
    if (broken && !isVideo) {
      return (
        <div className="h-40 bg-gradient-to-br from-[#1a1033] via-[#0a0a0f] to-[#1e1b4b] flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-white/30" />
        </div>
      );
    }
    return (
      <div className="relative h-40 overflow-hidden">
        {isVideo ? (
          <FocusedVideo
            src={displayUrl}
            wrapperClassName="absolute inset-0"
            onError={() => setBroken(true)}
          />
        ) : (
        <FocusedImage
          src={displayUrl}
          alt={t("fileUpload.backgroundAlt")}
          focus={mediaFocus}
          priority
          wrapperClassName="absolute inset-0"
          onError={() => setBroken(true)}
        />
        )}
        <MediaTypeBadge type={resolvedType} />
      </div>
    );
  }

  if (
    kind === "favicon" ||
    kind === "profileIcon" ||
    kind === "cursor" ||
    kind === "musicCover"
  ) {
    if (broken) {
      return (
        <div className="w-16 h-16 mx-auto my-3 rounded-xl bg-white/5 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-white/30" />
        </div>
      );
    }
    return (
      <div className="w-16 h-16 mx-auto my-3">
        <FocusedImage
          src={displayUrl}
          alt=""
          wrapperClassName="h-full w-full rounded-xl"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  return null;
}

export default function FileUpload({
  kind,
  label,
  hint,
  currentUrl,
  mediaType,
  accept,
  onUploaded,
  onClear,
  mediaFocus,
  onMediaFocusChange,
}: Props) {
  const { t, tVars } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const isBackground = kind === "background";
  const isBanner = kind === "banner";
  const allowsDragDrop = isBackground || isBanner;

  const uploadFile = (
    file: File,
    onProgress: (percent: number) => void
  ): Promise<{ url: string; backgroundType?: BackgroundType }> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 413) {
          reject(
            new Error(
              tVars("fileUpload.fileTooLarge", { limit: getUploadLimitMb(kind) })
            )
          );
          return;
        }

        try {
          const data = JSON.parse(xhr.responseText) as {
            url?: string;
            backgroundType?: BackgroundType;
            error?: string;
          };
          if (xhr.status >= 200 && xhr.status < 300 && data.url) {
            resolve({ url: data.url, backgroundType: data.backgroundType });
            return;
          }
          reject(new Error(data.error ?? t("fileUpload.uploadError")));
        } catch {
          reject(new Error(t("fileUpload.uploadError")));
        }
      });

      xhr.addEventListener("error", () => reject(new Error(t("fileUpload.uploadError"))));
      xhr.addEventListener("abort", () => reject(new Error(t("fileUpload.uploadError"))));

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });

  const resolveValidationError = (file: File): string | null => {
    const validation = getUploadValidationError(kind, file);
    if (!validation) return null;
    if (validation.code === "size") {
      return tVars("fileUpload.fileTooLarge", { limit: validation.limitMb });
    }
    return t("fileUpload.fileTypeNotAllowed");
  };

  const rejectInvalidFile = (file: File): boolean => {
    const message = resolveValidationError(file);
    if (!message) return false;
    setError(message);
    if (inputRef.current) inputRef.current.value = "";
    return true;
  };

  const handleFile = async (file: File) => {
    if (rejectInvalidFile(file)) return;

    setLocalPreview(file);
    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const data = await uploadFile(file, setProgress);
      clearLocalPreview();
      onUploaded(data.url, data.backgroundType);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("fileUpload.uploadError"));
    } finally {
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFilePicked(file);
  };

  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [localPreviewType, setLocalPreviewType] = useState<BackgroundType | undefined>();

  useEffect(() => {
    return () => {
      if (localPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const clearLocalPreview = () => {
    setLocalPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setLocalPreviewType(undefined);
  };

  const setLocalPreview = (file: File) => {
    if (kind !== "background" && kind !== "banner" && kind !== "avatar") return;
    setLocalPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    if (kind === "background") {
      if (file.type.startsWith("video/")) setLocalPreviewType("video");
      else if (file.type === "image/gif") setLocalPreviewType("gif");
      else setLocalPreviewType("image");
    }
  };

  const previewUrl = localPreviewUrl ?? currentUrl;
  const previewMediaType = localPreviewUrl ? localPreviewType ?? mediaType : mediaType;
  const isAudio = kind === "audio";
  const canAdjust = isAdjustableUploadKind(kind);
  const adjustPreset = IMAGE_ADJUST_PRESETS[kind];
  const [adjustSrc, setAdjustSrc] = useState<string | null>(null);
  const [adjustFileName, setAdjustFileName] = useState("image.jpg");
  const [adjustMediaKind, setAdjustMediaKind] = useState<"image" | "video">("image");

  useEffect(() => {
    return () => {
      if (adjustSrc?.startsWith("blob:")) URL.revokeObjectURL(adjustSrc);
    };
  }, [adjustSrc]);

  const openAdjust = async (source: string, fileName: string, mediaKind: "image" | "video") => {
    setAdjustFileName(fileName);
    setAdjustMediaKind(mediaKind);
    setAdjustSrc(source);
  };

  const closeAdjust = () => {
    if (adjustSrc?.startsWith("blob:")) URL.revokeObjectURL(adjustSrc);
    setAdjustSrc(null);
    pendingFileRef.current = null;
  };

  const startAdjustFromFile = (file: File) => {
    pendingFileRef.current = file;
    const src = URL.createObjectURL(file);
    const mediaKind = file.type.startsWith("video/") ? "video" : "image";
    void openAdjust(src, file.name, mediaKind);
  };

  const startAdjustFromUrl = async () => {
    if (!currentUrl || !canAdjust) return;
    pendingFileRef.current = null;
    const isVideo = previewMediaType === "video";
    try {
      const res = await fetch(getMediaSrc(currentUrl));
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      if (!blob.type.startsWith("image/") && !blob.type.startsWith("video/")) return;
      const src = URL.createObjectURL(blob);
      const name = currentUrl.split("/").pop()?.split("?")[0] || (isVideo ? "video.mp4" : "image.jpg");
      void openAdjust(src, name, blob.type.startsWith("video/") || isVideo ? "video" : "image");
    } catch {
      setError(t("imageAdjust.loadError"));
    }
  };

  const handleAdjustConfirm = async (result: { focus: MediaFocus }) => {
    if (onMediaFocusChange) {
      onMediaFocusChange(result.focus);
    }

    const pending = pendingFileRef.current;
    if (pending) {
      await handleFile(pending);
      pendingFileRef.current = null;
    }
  };

  const onFilePicked = (file: File) => {
    if (rejectInvalidFile(file)) return;

    if (canAdjust && isAdjustableMediaFile(file, kind) && adjustPreset) {
      startAdjustFromFile(file);
      return;
    }
    void handleFile(file);
  };

  const adjustTitle =
    kind === "avatar"
      ? t("imageAdjust.titleAvatar")
      : kind === "banner"
        ? t("imageAdjust.titleBanner")
        : t("imageAdjust.titleBackground");

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm text-white/60">{label}</label>}

      {currentUrl && isAudio && (
        <div className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5">
          <Music className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-sm text-white/60 truncate flex-1">{t("fileUpload.audioUploaded")}</span>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg bg-black/40 text-white/70 hover:text-white shrink-0"
              aria-label={t("fileUpload.removeAudio")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {previewUrl && !isAudio && (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <MediaPreview
            kind={kind}
            currentUrl={previewUrl}
            mediaType={previewMediaType}
            mediaFocus={mediaFocus}
          />
            {uploading && (
              <div className="absolute inset-0 z-10 flex items-end bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                <div className="w-full px-3 pb-3">
                  <div className="h-1 rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-[width] duration-150"
                      style={{ width: `${progress ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            {onClear && !uploading && (
              <button
                type="button"
                onClick={() => {
                  clearLocalPreview();
                  onClear();
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-white z-10"
                aria-label={t("fileUpload.removeFile")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {canAdjust && currentUrl && isAdjustableMediaUrl(currentUrl, kind) && adjustPreset && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => void startAdjustFromUrl()}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-white/60 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/10 transition-colors disabled:opacity-50"
            >
              <Crop className="w-3.5 h-3.5" />
              {t("imageAdjust.adjustExisting")}
            </button>
          )}
        </div>
      )}

      <div
        onDragOver={(e) => {
          if (!allowsDragDrop) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={allowsDragDrop ? handleDrop : undefined}
      >
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={`w-full flex flex-col items-center justify-center gap-2 py-5 border border-dashed rounded-xl text-white/50 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-sm disabled:opacity-50 ${
            dragOver ? "border-purple-500/50 bg-purple-500/10 text-white" : "border-white/10"
          }`}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span>
            {uploading
              ? progress !== null
                ? tVars("fileUpload.uploadingPercent", { percent: progress })
                : t("fileUpload.uploading")
              : currentUrl
                ? t("fileUpload.changeFile")
                : localPreviewUrl
                  ? t("fileUpload.uploading")
                  : isBanner
                  ? t("fileUpload.uploadBanner")
                  : isBackground
                    ? t("fileUpload.uploadBackground")
                    : t("fileUpload.upload")}
          </span>
          {uploading && progress !== null && (
            <div className="w-full max-w-[200px] h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {isBackground && !uploading && (
            <span className="text-[11px] text-white/30">
              {t("fileUpload.dragHint")}
            </span>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept ?? ACCEPT_ATTR[kind]}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFilePicked(file);
        }}
      />

      {adjustSrc && adjustPreset && (
        <ImageAdjustModal
          open
          imageSrc={adjustSrc}
          mediaKind={adjustMediaKind}
          preset={adjustPreset}
          title={adjustTitle}
          initialFocus={mediaFocus}
          onClose={closeAdjust}
          onConfirm={handleAdjustConfirm}
        />
      )}

      {hint && <p className="text-xs text-white/30">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
