"use client";

import { useEffect, useState } from "react";
import { BackgroundType } from "@/types/profile";
import { resolveBackgroundType } from "@/lib/media-config";
import { DEFAULT_MEDIA_FOCUS, type MediaFocus } from "@/lib/media-focus";
import { getMediaSrc } from "@/lib/media-url";
import { FocusedImage, FocusedVideo } from "@/components/FocusedMedia";

interface Props {
  url: string;
  type: BackgroundType;
  contained?: boolean;
  focus?: MediaFocus;
}

const FALLBACK_CLASS =
  "bg-gradient-to-br from-[#1a1033] via-[#0a0a0f] to-[#1e1b4b]";

export default function BackgroundMedia({
  url,
  type,
  contained = false,
  focus,
}: Props) {
  const [broken, setBroken] = useState(false);
  const [useBackgroundCss, setUseBackgroundCss] = useState(false);
  const shellClass = contained
    ? "absolute inset-0 overflow-hidden"
    : "fixed inset-0 z-0 h-[100dvh] w-screen overflow-hidden";
  const pointerClass = "pointer-events-none";
  const mediaType = resolveBackgroundType(url, type);
  const displayUrl = getMediaSrc(url);
  const mediaFocus = focus ?? DEFAULT_MEDIA_FOCUS;

  useEffect(() => {
    setBroken(false);
    setUseBackgroundCss(false);
  }, [url, type]);

  if (!url?.trim() || broken) {
    return (
      <div
        className={`${shellClass} ${FALLBACK_CLASS} ${pointerClass}`}
        aria-hidden="true"
      />
    );
  }

  if (mediaType === "video") {
    return (
      <div className={`${shellClass} ${pointerClass}`} aria-hidden="true">
        <FocusedVideo
          src={displayUrl}
          focus={mediaFocus}
          wrapperClassName="absolute inset-0"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  if (useBackgroundCss) {
    return (
      <div
        className={`${shellClass} ${pointerClass}`}
        style={{
          backgroundImage: `url("${displayUrl}")`,
          backgroundSize: `${mediaFocus.zoom * 100}%`,
          backgroundPosition: `${mediaFocus.x}% ${mediaFocus.y}%`,
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={`${shellClass} ${pointerClass}`} aria-hidden="true">
      <FocusedImage
        src={displayUrl}
        alt=""
        focus={mediaFocus}
        wrapperClassName="absolute inset-0"
        onError={() => {
          if (!useBackgroundCss) {
            setUseBackgroundCss(true);
            return;
          }
          setBroken(true);
        }}
      />
    </div>
  );
}
