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
import { ACCEPT_ATTR, UploadKind, resolveBackgroundType } from "@/lib/media-config";
import { getMediaSrc } from "@/lib/media-url";
import {
  IMAGE_ADJUST_PRESETS,
  isAdjustableImageFile,
  isAdjustableImageUrl,
  isAdjustableUploadKind,
} from "@/lib/image-adjust-config";
import ImageAdjustModal from "@/components/ImageAdjustModal";
import { DEFAULT_MEDIA_FOCUS, mediaFocusStyle, type MediaFocus } from "@/lib/media-focus";
import { useI18n } from "@/components/LocaleProvider";

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
      <img
        src={displayUrl}
        alt={t("fileUpload.avatarAlt")}
        referrerPolicy="no-referrer"
        decoding="async"
        className="w-20 h-20 object-cover mx-auto my-3 rounded-full"
        onError={() => setBroken(true)}
      />
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
      <img
        src={displayUrl}
        alt={t("fileUpload.bannerAlt")}
        referrerPolicy="no-referrer"
        decoding="async"
        className="w-full h-24 object-cover object-center"
        onError={() => setBroken(true)}
      />
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
    const focusStyle = mediaFocusStyle(mediaFocus ?? DEFAULT_MEDIA_FOCUS);

    return (
      <div className="relative h-40 overflow-hidden">
        {isVideo ? (
          <video
            src={displayUrl}
            className="w-full h-full object-cover"
            style={focusStyle}
            muted
            loop
            autoPlay
            playsInline
            onError={() => setBroken(true)}
          />
        ) : (
          <img
            src={displayUrl}
            alt={t("fileUpload.backgroundAlt")}
            referrerPolicy="no-referrer"
            decoding="async"
            className="w-full h-full object-cover"
            style={focusStyle}
            onError={() => setBroken(true)}
          />
        )}
        <MediaTypeBadge type={resolvedType} />
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

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const data = await uploadFile(file, setProgress);
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

  const isAudio = kind === "audio";
  const canAdjust = isAdjustableUploadKind(kind);
  const adjustPreset = IMAGE_ADJUST_PRESETS[kind];
  const [adjustSrc, setAdjustSrc] = useState<string | null>(null);
  const [adjustFileName, setAdjustFileName] = useState("image.jpg");

  useEffect(() => {
    return () => {
      if (adjustSrc?.startsWith("blob:")) URL.revokeObjectURL(adjustSrc);
    };
  }, [adjustSrc]);

  const openAdjust = async (source: string, fileName: string) => {
    setAdjustFileName(fileName);
    setAdjustSrc(source);
  };

  const closeAdjust = () => {
    if (adjustSrc?.startsWith("blob:")) URL.revokeObjectURL(adjustSrc);
    setAdjustSrc(null);
    pendingFileRef.current = null;
  };

  const uploadBlob = async (blob: Blob, fileName: string) => {
    const ext =
      blob.type === "image/png"
        ? ".png"
        : blob.type === "image/webp"
          ? ".webp"
          : ".jpg";
    const file = new File([blob], fileName.replace(/\.[^.]+$/, ext) || `image${ext}`, {
      type: blob.type || "image/jpeg",
    });
    await handleFile(file);
  };

  const startAdjustFromFile = (file: File) => {
    pendingFileRef.current = file;
    const src = URL.createObjectURL(file);
    void openAdjust(src, file.name);
  };

  const startAdjustFromUrl = async () => {
    if (!currentUrl || !canAdjust) return;
    pendingFileRef.current = null;
    try {
      const res = await fetch(getMediaSrc(currentUrl));
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) return;
      const src = URL.createObjectURL(blob);
      const name = currentUrl.split("/").pop()?.split("?")[0] || "image.jpg";
      void openAdjust(src, name);
    } catch {
      setError(t("imageAdjust.loadError"));
    }
  };

  const handleAdjustConfirm = async (result: {
    focus: MediaFocus;
    blob?: Blob;
  }) => {
    if (kind === "background" && onMediaFocusChange) {
      onMediaFocusChange(result.focus);
    }

    if (result.blob) {
      const name = adjustFileName;
      await uploadBlob(result.blob, name);
      pendingFileRef.current = null;
      return;
    }

    const pending = pendingFileRef.current;
    if (pending) {
      await handleFile(pending);
      pendingFileRef.current = null;
    }
  };

  const onFilePicked = (file: File) => {
    if (canAdjust && isAdjustableImageFile(file, kind) && adjustPreset) {
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

      {currentUrl && !isAudio && (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <MediaPreview
            kind={kind}
            currentUrl={currentUrl}
            mediaType={mediaType}
            mediaFocus={kind === "background" ? mediaFocus : undefined}
          />
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-white z-10"
                aria-label={t("fileUpload.removeFile")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {canAdjust && isAdjustableImageUrl(currentUrl, kind) && adjustPreset && (
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
          preset={adjustPreset}
          title={adjustTitle}
          initialFocus={kind === "background" ? mediaFocus : undefined}
          onClose={closeAdjust}
          onConfirm={handleAdjustConfirm}
        />
      )}

      {hint && <p className="text-xs text-white/30">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
