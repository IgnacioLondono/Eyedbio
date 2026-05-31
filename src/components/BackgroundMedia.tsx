"use client";

import { useEffect, useState } from "react";
import { BackgroundType } from "@/types/profile";

interface Props {
  url: string;
  type: BackgroundType;
  contained?: boolean;
}

const FALLBACK_CLASS =
  "bg-gradient-to-br from-[#1a1033] via-[#0a0a0f] to-[#1e1b4b]";

export default function BackgroundMedia({ url, type, contained = false }: Props) {
  const [broken, setBroken] = useState(false);
  const positionClass = contained ? "absolute inset-0 h-full w-full" : "fixed inset-0";
  const pointerClass = contained ? "pointer-events-none" : "";

  useEffect(() => {
    setBroken(false);
  }, [url]);

  if (!url?.trim() || broken) {
    return (
      <div
        className={`${positionClass} ${FALLBACK_CLASS} ${pointerClass}`}
        aria-hidden="true"
      />
    );
  }

  if (type === "video") {
    return (
      <video
        className={`${positionClass} object-cover ${pointerClass}`}
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

  if (type === "gif" || type === "image") {
    return (
      <img
        src={url}
        alt=""
        className={`${positionClass} object-cover ${pointerClass}`}
        onError={() => setBroken(true)}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`${positionClass} bg-cover bg-center bg-no-repeat ${pointerClass} ${FALLBACK_CLASS}`}
      style={{ backgroundImage: `url(${url})` }}
      aria-hidden="true"
    />
  );
}
