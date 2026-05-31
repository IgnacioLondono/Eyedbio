"use client";

import { BackgroundType } from "@/types/profile";

interface Props {
  url: string;
  type: BackgroundType;
}

export default function BackgroundMedia({ url, type }: Props) {
  if (type === "video") {
    return (
      <video
        className="fixed inset-0 w-full h-full object-cover"
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
        className="fixed inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${url})` }}
      aria-hidden="true"
    />
  );
}
