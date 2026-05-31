"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { BackgroundType } from "@/types/profile";
import { ACCEPT_ATTR, UploadKind } from "@/lib/media-config";

interface Props {
  kind: UploadKind;
  label: string;
  hint?: string;
  currentUrl?: string;
  accept?: string;
  onUploaded: (url: string, backgroundType?: BackgroundType) => void;
  onClear?: () => void;
}

export default function FileUpload({
  kind,
  label,
  hint,
  currentUrl,
  accept,
  onUploaded,
  onClear,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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

  const isVideo = currentUrl?.match(/\.(mp4|webm|mov)(\?|$)/i);
  const isAudio = kind === "audio";

  return (
    <div className="space-y-2">
      <label className="block text-sm text-white/60">{label}</label>

      {currentUrl && (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
          {kind === "avatar" && (
            <img src={currentUrl} alt="Avatar" className="w-20 h-20 object-cover mx-auto my-3 rounded-full" />
          )}
          {kind === "background" && (
            <div className="h-28">
              {isVideo ? (
                <video src={currentUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
              ) : (
                <img src={currentUrl} alt="Fondo" className="w-full h-full object-cover" />
              )}
            </div>
          )}
          {isAudio && (
            <div className="p-4">
              <audio src={currentUrl} controls className="w-full h-8" />
            </div>
          )}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-white"
              aria-label="Quitar archivo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 rounded-xl text-white/50 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-sm disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {uploading ? "Subiendo..." : currentUrl ? "Cambiar archivo" : "Subir archivo"}
      </button>

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
