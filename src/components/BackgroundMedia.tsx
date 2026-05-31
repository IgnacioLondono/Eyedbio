"use client";

import { useEffect, useState } from "react";
import { BackgroundType } from "@/types/profile";
import { resolveBackgroundType } from "@/lib/media-config";
import { getMediaSrc } from "@/lib/media-url";

interface Props {
  url: string;
  type: BackgroundType;
  contained?: boolean;
}

const FALLBACK_CLASS =
  "bg-gradient-to-br from-[#1a1033] via-[#0a0a0f] to-[#1e1b4b]";

export default function BackgroundMedia({ url, type, contained = false }: Props) {
  const [broken, setBroken] = useState(false);
  const [useBackgroundCss, setUseBackgroundCss] = useState(false);
  const positionClass = contained ? "absolute inset-0 h-full w-full" : "fixed inset-0";
  const pointerClass = contained ? "pointer-events-none" : "";
  const mediaType = resolveBackgroundType(url, type);
  const displayUrl = getMediaSrc(url);

  useEffect(() => {
    setBroken(false);
    setUseBackgroundCss(false);
  }, [url, type]);

  if (!url?.trim() || broken) {
    return (
      <div
        className={`${positionClass} ${FALLBACK_CLASS} ${pointerClass}`}
        aria-hidden="true"
      />
    );
  }

  if (mediaType === "video") {
    return (
      <video
        key={url}
        className={`${positionClass} object-cover object-center ${pointerClass}`}
        src={url}
        autoPlay
        loop
        muted
        playsInline
        onError={() => setBroken(true)}
        aria-hidden="true"
      />
    );
  }

  if (useBackgroundCss) {
    return (
      <div
        key={`${url}-css`}
        className={`${positionClass} bg-cover bg-center bg-no-repeat ${pointerClass}`}
        style={{ backgroundImage: `url("${displayUrl}")` }}
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      <img
        key={displayUrl}
        src={displayUrl}
        alt=""
        referrerPolicy="no-referrer"
        decoding="async"
        className={`${positionClass} object-cover object-center min-h-full min-w-full ${pointerClass}`}
        onError={() => {
          if (!useBackgroundCss) {
            setUseBackgroundCss(true);
            return;
          }
          setBroken(true);
        }}
        aria-hidden="true"
      />
    </>
  );
}
