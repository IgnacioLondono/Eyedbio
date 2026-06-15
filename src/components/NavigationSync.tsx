"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { teardownProfilePresentation } from "@/lib/profile-teardown";

/**
 * Si la URL del navegador y el router de Next.js divergen (atrás/adelante),
 * fuerza una navegación real para no dejar el perfil u otra vista en pantalla.
 */
export default function NavigationSync() {
  const pathname = usePathname();

  useEffect(() => {
    const syncFromBrowser = () => {
      const browserPath = window.location.pathname;
      if (browserPath === pathname) return;

      teardownProfilePresentation();

      const target = `${browserPath}${window.location.search}${window.location.hash}`;
      window.location.assign(target);
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
  }, [pathname]);

  return null;
}
