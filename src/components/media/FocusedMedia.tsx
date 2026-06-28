"use client";

import {
  DEFAULT_MEDIA_FOCUS,
  mediaFocusStyle,
  type MediaFocus,
} from "@/lib/media/media-focus";

interface ImageProps {
  src: string;
  alt?: string;
  focus?: MediaFocus;
  wrapperClassName?: string;
  imgClassName?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function FocusedImage({
  src,
  alt = "",
  focus,
  wrapperClassName = "",
  imgClassName = "",
  priority = false,
  onLoad,
  onError,
}: ImageProps) {
  const focusStyle = mediaFocusStyle(focus ?? DEFAULT_MEDIA_FOCUS);

  return (
    <div className={`relative h-full w-full overflow-hidden ${wrapperClassName}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        decoding="async"
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        style={focusStyle}
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
}

interface VideoProps {
  src: string;
  focus?: MediaFocus;
  wrapperClassName?: string;
  videoClassName?: string;
  priority?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  /** Fuerza remount al cambiar estado de reproducción (p. ej. pantalla de entrada). */
  instanceKey?: string;
  videoRef?: (element: HTMLVideoElement | null) => void;
  onReady?: () => void;
  onError?: () => void;
}

export function FocusedVideo({
  src,
  focus,
  wrapperClassName = "",
  videoClassName = "",
  priority = false,
  autoPlay = true,
  muted = true,
  instanceKey,
  videoRef,
  onReady,
  onError,
}: VideoProps) {
  const focusStyle = mediaFocusStyle(focus ?? DEFAULT_MEDIA_FOCUS);

  return (
    <div className={`relative h-full w-full overflow-hidden ${wrapperClassName}`}>
      <video
        ref={videoRef}
        key={instanceKey ?? src}
        src={src}
        className={`absolute inset-0 h-full w-full object-cover ${videoClassName}`}
        style={focusStyle}
        autoPlay={autoPlay}
        loop
        muted={muted}
        playsInline
        preload={priority ? "auto" : "metadata"}
        onLoadedData={onReady}
        onLoadedMetadata={onReady}
        onCanPlay={onReady}
        onError={onError}
      />
    </div>
  );
}
