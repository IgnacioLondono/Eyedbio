"use client";

import { useEffect, useState } from "react";
import { BackgroundType } from "@/types/profile";
import { resolveBackgroundType } from "@/lib/media-config";
import { DEFAULT_MEDIA_FOCUS, mediaFocusStyle, type MediaFocus } from "@/lib/media-focus";
import { getMediaSrc } from "@/lib/media-url";

interface Props {
  url: string;
  type: BackgroundType;
  contained?: boolean;
  focus?: MediaFocus;
}

const FALLBACK_CLASS =
  "bg-gradient-to-br from-[#1a1033] via-[#0a0a0f] to-[#1e1b4b]";

const MEDIA_CLASS =
  "absolute inset-0 h-full w-full min-h-full min-w-full object-cover";

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
  const focusStyle = mediaFocusStyle(focus ?? DEFAULT_MEDIA_FOCUS);

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
        <video
          key={url}
          className={MEDIA_CLASS}
          style={focusStyle}
          src={displayUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  if (useBackgroundCss) {
    const f = focus ?? DEFAULT_MEDIA_FOCUS;
    return (
      <div
        key={`${url}-css`}
        className={`${shellClass} ${pointerClass}`}
        style={{
          backgroundImage: `url("${displayUrl}")`,
          backgroundSize: `${f.zoom * 100}%`,
          backgroundPosition: `${f.x}% ${f.y}%`,
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={`${shellClass} ${pointerClass}`} aria-hidden="true">
      <img
        key={displayUrl}
        src={displayUrl}
        alt=""
        referrerPolicy="no-referrer"
        decoding="async"
        className={MEDIA_CLASS}
        style={focusStyle}
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
