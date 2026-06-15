"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { teardownProfilePresentation, PROFILE_VIEW_ROOT_ATTR } from "@/lib/profile-teardown";
import { useBrowserPathname } from "@/lib/use-browser-pathname";

/**
 * Si la URL del navegador y el router de Next.js divergen (atrás/adelante),
 * fuerza una navegación real para no dejar el perfil u otra vista en pantalla.
 */
export default function NavigationSync() {
  const pathname = usePathname();
  const browserPathname = useBrowserPathname();

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

  useEffect(() => {
    if (browserPathname === pathname) return;
    if (!document.querySelector(`[${PROFILE_VIEW_ROOT_ATTR}]`)) return;

    teardownProfilePresentation();
    const target = `${browserPathname}${window.location.search}${window.location.hash}`;
    window.location.assign(target);
  }, [browserPathname, pathname]);

  return null;
}
