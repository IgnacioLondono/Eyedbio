import { useEffect } from "react";

/** Ejecuta un callback cada `intervalMs` mientras la pestaña está visible. */
export function useIntervalWhenVisible(
  callback: () => void,
  intervalMs: number,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (document.visibilityState === "visible") callback();
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [callback, intervalMs, enabled]);
}
