"use client";

import { BackgroundType } from "@/types/profile";

interface Props {
  url: string;
  type: BackgroundType;
  contained?: boolean;
}

export default function BackgroundMedia({ url, type, contained = false }: Props) {
  const positionClass = contained ? "absolute inset-0" : "fixed inset-0";
  const pointerClass = contained ? "pointer-events-none" : "";

  if (type === "video") {
    return (
      <video
        className={`${positionClass} w-full h-full object-cover ${pointerClass}`}
        src={url}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
    );
  }

  if (type === "gif") {
    return (
      <img
        src={url}
        alt=""
        className={`${positionClass} w-full h-full object-cover ${pointerClass}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`${positionClass} bg-cover bg-center bg-no-repeat ${pointerClass}`}
      style={{ backgroundImage: `url(${url})` }}
      aria-hidden="true"
    />
  );
}
