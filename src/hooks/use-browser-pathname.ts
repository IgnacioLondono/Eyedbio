"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

type Listener = () => void;

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  const { pushState, replaceState } = history;

  history.pushState = function (...args) {
    pushState.apply(history, args);
    emit();
  };

  history.replaceState = function (...args) {
    replaceState.apply(history, args);
    emit();
  };

  window.addEventListener("popstate", emit);
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getBrowserPathname(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname;
}

/** Ruta real del navegador; detecta pushState/replaceState antes que usePathname. */
export function useBrowserPathname(): string {
  const pathname = usePathname();
  return useSyncExternalStore(subscribe, getBrowserPathname, () => pathname);
}

export function pathsMatchRoute(pathname: string, routePath: string): boolean {
  return pathname.toLowerCase() === routePath.toLowerCase();
}
