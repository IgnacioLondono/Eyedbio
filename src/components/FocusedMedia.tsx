"use client";

import {
  DEFAULT_MEDIA_FOCUS,
  mediaFocusPositionStyle,
  mediaFocusStyle,
  type MediaFocus,
} from "@/lib/media-focus";

interface ImageProps {
  src: string;
  alt?: string;
  focus?: MediaFocus;
  wrapperClassName?: string;
  imgClassName?: string;
  onError?: () => void;
}

export function FocusedImage({
  src,
  alt = "",
  focus,
  wrapperClassName = "",
  imgClassName = "",
  onError,
}: ImageProps) {
  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        decoding="async"
        draggable={false}
        className={imgClassName}
        style={mediaFocusPositionStyle(focus ?? DEFAULT_MEDIA_FOCUS)}
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
  onError?: () => void;
}

export function FocusedVideo({
  src,
  focus,
  wrapperClassName = "",
  videoClassName = "",
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
        preload="auto"
        onError={onError}
      />
    </div>
  );
}
