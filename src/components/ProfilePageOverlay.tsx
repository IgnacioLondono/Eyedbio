"use client";

import type { PageOverlay } from "@/lib/profile-overlay-config";

interface DimProps {
  dim: number;
  className?: string;
}

export function ProfileBackgroundDim({ dim, className = "" }: DimProps) {
  if (dim <= 0) return null;
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ backgroundColor: `rgba(0,0,0,${dim})` }}
      aria-hidden
    />
  );
}

interface OverlayProps {
  overlay: PageOverlay;
  className?: string;
}

export default function ProfilePageOverlay({ overlay, className = "z-[2]" }: OverlayProps) {
  if (overlay === "none") return null;

  const showScanlines = overlay === "scanlines" || overlay === "crt";
  const showGrain = overlay === "grain" || overlay === "crt";
  const showVignette = overlay === "vignette" || overlay === "crt";

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden>
      {showScanlines ? (
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.85) 0px, rgba(0,0,0,0.85) 1px, transparent 1px, transparent 3px)",
            backgroundSize: "100% 3px",
          }}
        />
      ) : null}
      {showGrain ? (
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      ) : null}
      {showVignette ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      ) : null}
    </div>
  );
}
