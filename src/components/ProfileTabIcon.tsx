"use client";

import { useEffect } from "react";
import { getMediaSrc } from "@/lib/media-url";

const MARKER = "data-eyed-profile-favicon";

interface Props {
  iconUrl?: string;
}

export default function ProfileTabIcon({ iconUrl }: Props) {
  useEffect(() => {
    const trimmed = iconUrl?.trim();
    let link = document.querySelector<HTMLLinkElement>(`link[${MARKER}]`);

    if (!trimmed) {
      link?.remove();
      return;
    }

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.setAttribute(MARKER, "true");
      document.head.appendChild(link);
    }

    link.href = getMediaSrc(trimmed);

    return () => {
      link?.remove();
    };
  }, [iconUrl]);

  return null;
}
