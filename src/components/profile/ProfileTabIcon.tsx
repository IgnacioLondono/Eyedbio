"use client";

import { useLayoutEffect } from "react";
import { getMediaSrc } from "@/lib/media/media-url";
import { profileTabIconType } from "@/lib/profile/profile-tab-icon";

const MARKER = "data-eyed-profile-favicon";

interface Props {
  iconUrl?: string;
}

export default function ProfileTabIcon({ iconUrl }: Props) {
  useLayoutEffect(() => {
    const trimmed = iconUrl?.trim();
    const href = trimmed ? getMediaSrc(trimmed) : null;

    const managed = document.querySelectorAll<HTMLLinkElement>(`link[${MARKER}]`);
    const defaults = document.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
    );

    if (!href) {
      managed.forEach((link) => link.remove());
      return;
    }

    defaults.forEach((link) => {
      if (!link.hasAttribute(MARKER)) link.remove();
    });

    let link = document.querySelector<HTMLLinkElement>(`link[${MARKER}]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.setAttribute(MARKER, "true");
      document.head.prepend(link);
    }

    const typedHref = href.includes("?") ? href : `${href}?v=1`;
    link.href = typedHref;
    link.type = profileTabIconType(href);

    return () => {
      link?.remove();
    };
  }, [iconUrl]);

  return null;
}
