"use client";

import { usePathname } from "next/navigation";

/** Fuerza remount al cambiar de ruta para no dejar vistas anteriores en pantalla. */
export default function RouteKey({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="contents">
      {children}
    </div>
  );
}
