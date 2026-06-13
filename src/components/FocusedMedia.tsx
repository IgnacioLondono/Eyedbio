"use client";

import {
  DEFAULT_MEDIA_FOCUS,
  mediaFocusStyle,
  type MediaFocus,
} from "@/lib/media-focus";

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
        className={`absolute inset-0 h-full w-full min-h-full min-w-full object-cover ${imgClassName}`}
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
  onReady?: () => void;
  onError?: () => void;
}

export function FocusedVideo({
  src,
  focus,
  wrapperClassName = "",
  videoClassName = "",
  priority = false,
  onReady,
  onError,
}: VideoProps) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${wrapperClassName}`}>
      <video
        key={src}
        src={src}
        className={`absolute inset-0 h-full w-full min-h-full min-w-full object-cover ${videoClassName}`}
        style={mediaFocusStyle(focus ?? DEFAULT_MEDIA_FOCUS)}
        autoPlay
        loop
        muted
        playsInline
        preload={priority ? "auto" : "metadata"}
        onLoadedData={onReady}
        onCanPlay={onReady}
        onError={onError}
      />
    </div>
  );
}
