"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Corrige desfases entre la URL del navegador y el router de Next.js
 * (p. ej. tras historial manual o bfcache al usar atrás/adelante).
 */
export default function NavigationSync() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const syncFromBrowser = () => {
      const browserPath = window.location.pathname;
      if (browserPath === pathname) return;
      router.replace(`${browserPath}${window.location.search}${window.location.hash}`);
    };

    window.addEventListener("popstate", syncFromBrowser);

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      syncFromBrowser();
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("popstate", syncFromBrowser);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [pathname, router]);

  return null;
}
