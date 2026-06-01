"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Loader2, X, ImageIcon, Film, Image as ImageLucide, Music } from "lucide-react";
import { BackgroundType } from "@/types/profile";
import { ACCEPT_ATTR, UploadKind, resolveBackgroundType } from "@/lib/media-config";
import { getMediaSrc } from "@/lib/media-url";

interface Props {
  kind: UploadKind;
  label: string;
  hint?: string;
  currentUrl?: string;
  mediaType?: BackgroundType;
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
  const labels: Record<BackgroundType, string> = {
    image: "Imagen",
    gif: "GIF",
    video: "Video",
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
}: {
  kind: UploadKind;
  currentUrl: string;
  mediaType?: BackgroundType;
}) {
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
        alt="Avatar"
        referrerPolicy="no-referrer"
        decoding="async"
        className="w-20 h-20 object-cover mx-auto my-3 rounded-full"
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
    return (
      <div className="relative h-40">
        {isVideo ? (
          <video
            src={currentUrl}
            className="w-full h-full object-cover"
            muted
            loop
            autoPlay
            playsInline
            onError={() => setBroken(true)}
          />
        ) : (
          <img
            src={displayUrl}
            alt="Fondo"
            referrerPolicy="no-referrer"
            decoding="async"
            className="w-full h-full object-cover object-center"
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
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const isBackground = kind === "background";

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir");

      onUploaded(data.url, data.backgroundType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const isAudio = kind === "audio";

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm text-white/60">{label}</label>}

      {currentUrl && isAudio && (
        <div className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5">
          <Music className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-sm text-white/60 truncate flex-1">Audio subido</span>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg bg-black/40 text-white/70 hover:text-white shrink-0"
              aria-label="Quitar audio"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {currentUrl && !isAudio && (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
          <MediaPreview kind={kind} currentUrl={currentUrl} mediaType={mediaType} />
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-white z-10"
              aria-label="Quitar archivo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div
        onDragOver={(e) => {
          if (!isBackground) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={isBackground ? handleDrop : undefined}
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
              ? "Subiendo..."
              : currentUrl
                ? "Cambiar archivo"
                : isBackground
                  ? "Subir imagen, GIF o video"
                  : "Subir archivo"}
          </span>
          {isBackground && !uploading && (
            <span className="text-[11px] text-white/30">
              Arrastra aquí o haz clic · JPG, PNG, WebP, GIF, MP4, WebM, MOV
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
          if (file) handleFile(file);
        }}
      />

      {hint && <p className="text-xs text-white/30">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
