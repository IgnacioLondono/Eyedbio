"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ExternalLinkConfirmModal from "@/components/profile/ExternalLinkConfirmModal";
import { getExternalLinkDisplayUrl, resolveExternalHref } from "@/lib/social-link-utils";

export type ExternalLinkVisitMeta = {
  linkId: string;
  profileUsername: string;
};

type PendingLink = {
  href: string;
  displayUrl: string;
  meta?: ExternalLinkVisitMeta;
};

type ExternalLinkConfirmContextValue = {
  requestVisit: (href: string, meta?: ExternalLinkVisitMeta) => void;
};

const ExternalLinkConfirmContext = createContext<ExternalLinkConfirmContextValue | null>(null);

export function ExternalLinkConfirmProvider({
  locale,
  children,
}: {
  locale: "es" | "en";
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState<PendingLink | null>(null);

  const requestVisit = useCallback((href: string, meta?: ExternalLinkVisitMeta) => {
    const resolved = resolveExternalHref(href);
    setPending({
      href: resolved,
      displayUrl: getExternalLinkDisplayUrl(href),
      meta,
    });
  }, []);

  const close = useCallback(() => setPending(null), []);

  const confirm = useCallback(() => {
    if (!pending) return;
    if (pending.meta) {
      void fetch(
        `/api/profile/${encodeURIComponent(pending.meta.profileUsername)}/links/${encodeURIComponent(pending.meta.linkId)}/click`,
        { method: "POST" }
      ).catch(() => {});
    }
    window.open(pending.href, "_blank", "noopener,noreferrer");
    setPending(null);
  }, [pending]);

  const value = useMemo(() => ({ requestVisit }), [requestVisit]);

  return (
    <ExternalLinkConfirmContext.Provider value={value}>
      {children}
      <ExternalLinkConfirmModal
        open={pending !== null}
        displayUrl={pending?.displayUrl ?? ""}
        locale={locale}
        onClose={close}
        onConfirm={confirm}
      />
    </ExternalLinkConfirmContext.Provider>
  );
}

export function useExternalLinkConfirm() {
  const context = useContext(ExternalLinkConfirmContext);
  if (!context) {
    throw new Error("useExternalLinkConfirm must be used within ExternalLinkConfirmProvider");
  }
  return context;
}
