"use client";

import { useCallback, useState } from "react";
import { SocialLink } from "@/types/profile";
import {
  getSocialLinkCopyValue,
  getSocialLinkHref,
  getSocialLinkTitle,
  isCopyOnlySocialLink,
} from "@/lib/social-link-utils";

export function useSocialLinkAction(link: SocialLink) {
  const [copied, setCopied] = useState(false);
  const copyOnly = isCopyOnlySocialLink(link.platform);
  const href = getSocialLinkHref(link);
  const title = getSocialLinkTitle(link);
  const copyValue = getSocialLinkCopyValue(link);

  const activate = useCallback(async () => {
    if (!copyOnly || !copyValue) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* portapapeles no disponible */
    }
  }, [copyOnly, copyValue]);

  return { copyOnly, href, title, copyValue, copied, activate };
}
