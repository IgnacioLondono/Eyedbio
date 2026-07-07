"use client";

import { useEffect, useRef } from "react";
import type { CursorTrailEffect, ProfileSettings } from "@/types/profile";
import { getMediaSrc } from "@/lib/media/media-url";
import {
  hasCustomCursor,
  hasCursorTrail,
  resolveCursorTrailColor,
  resolveCursorTrailEffect,
} from "@/lib/profile/cursor-config";

interface Props {
  settings: ProfileSettings;
  /** Si true, se limita al contenedor padre (vista previa). Si no, cubre el viewport. */
  contained?: boolean;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rot: number;
};

const MAX_CURSOR_PX = 32;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length >= 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return { r: 168, g: 85, b: 247 };
}

/** Reduce la imagen del cursor a un tamaño válido para navegadores (<=128px). */
async function buildCursorValue(url: string): Promise<string> {
  const src = getMediaSrc(url);
  const fallback = `url("${src}") 0 0, auto`;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const largest = Math.max(img.width, img.height);
      if (!largest || largest <= MAX_CURSOR_PX) {
        resolve(fallback);
        return;
      }
      try {
        const scale = MAX_CURSOR_PX / largest;
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(fallback);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(`url("${canvas.toDataURL("image/png")}") 0 0, auto`);
      } catch {
        resolve(fallback);
      }
    };
    img.onerror = () => resolve(fallback);
    img.src = src;
  });
}

export default function ProfileCursor({ settings, contained = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const customCursor = hasCustomCursor(settings);
  const trailEnabled = hasCursorTrail(settings);
  const cursorUrl = settings.cursorUrl?.trim() ?? "";
  const trailEffect: CursorTrailEffect = resolveCursorTrailEffect(
    settings.cursorTrailEffect
  );
  const trailColor = resolveCursorTrailColor(settings);

  // Cursor personalizado
  useEffect(() => {
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer || !customCursor || !cursorUrl) return;

    const canvas = canvasRef.current;
    const target: HTMLElement | null = contained
      ? (canvas?.parentElement as HTMLElement | null)
      : document.documentElement;
    if (!target) return;

    const previous = target.style.cursor;
    let active = true;

    void buildCursorValue(cursorUrl).then((value) => {
      if (active) target.style.cursor = value;
    });

    return () => {
      active = false;
      target.style.cursor = previous;
    };
  }, [customCursor, cursorUrl, contained]);

  // Estela / rastro
  useEffect(() => {
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced || !trailEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const host: HTMLElement =
      (contained ? (canvas.parentElement as HTMLElement | null) : null) ??
      document.documentElement;

    const { r, g, b } = hexToRgb(trailColor);
    const particles: Particle[] = [];
    const linePoints: { x: number; y: number }[] = [];
    let raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let lastX = 0;
    let lastY = 0;
    let hasPointer = false;

    const resize = () => {
      const rect = contained
        ? host.getBoundingClientRect()
        : { width: window.innerWidth, height: window.innerHeight };
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (x: number, y: number) => {
      const count = trailEffect === "sparkle" ? 2 : trailEffect === "dots" ? 1 : 1;
      for (let i = 0; i < count; i++) {
        const spread = trailEffect === "sparkle" ? 6 : 1.5;
        particles.push({
          x: x + (Math.random() - 0.5) * spread,
          y: y + (Math.random() - 0.5) * spread,
          vx: trailEffect === "sparkle" ? (Math.random() - 0.5) * 1.4 : 0,
          vy:
            trailEffect === "sparkle"
              ? (Math.random() - 0.5) * 1.4 + 0.3
              : 0,
          life: 1,
          maxLife: 1,
          size:
            trailEffect === "glow"
              ? 14 + Math.random() * 6
              : trailEffect === "sparkle"
                ? 3 + Math.random() * 3
                : 6 + Math.random() * 3,
          rot: Math.random() * Math.PI,
        });
      }
      if (particles.length > 220) particles.splice(0, particles.length - 220);
    };

    const onMove = (e: PointerEvent) => {
      let x: number;
      let y: number;
      if (contained) {
        const rect = host.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      } else {
        x = e.clientX;
        y = e.clientY;
      }
      lastX = x;
      lastY = y;
      hasPointer = true;

      if (trailEffect === "line") {
        linePoints.push({ x, y });
        if (linePoints.length > 22) linePoints.shift();
      } else {
        spawn(x, y);
      }
    };

    const drawSparkle = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-p.size, 0);
      ctx.lineTo(p.size, 0);
      ctx.moveTo(0, -p.size);
      ctx.lineTo(0, p.size);
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (trailEffect === "line") {
        if (linePoints.length > 1) {
          for (let i = 1; i < linePoints.length; i++) {
            const t = i / linePoints.length;
            ctx.strokeStyle = `rgba(${r},${g},${b},${t * 0.9})`;
            ctx.lineWidth = t * 6 + 0.5;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(linePoints[i - 1].x, linePoints[i - 1].y);
            ctx.lineTo(linePoints[i].x, linePoints[i].y);
            ctx.stroke();
          }
          // El rastro se va acortando cuando el puntero se detiene
          if (linePoints.length > 0 && Math.random() < 0.5) linePoints.shift();
        }
      } else {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= trailEffect === "glow" ? 0.05 : 0.035;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          const alpha = Math.max(0, p.life);

          if (trailEffect === "glow") {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            grad.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.5})`);
            grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else if (trailEffect === "sparkle") {
            drawSparkle(p, alpha);
          } else {
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.85})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Punto guía en la posición actual (glow/dots)
        if (hasPointer && trailEffect === "glow") {
          const grad = ctx.createRadialGradient(lastX, lastY, 0, lastX, lastY, 10);
          grad.addColorStop(0, `rgba(${r},${g},${b},0.35)`);
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(lastX, lastY, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(render);
    };

    resize();
    const resizeObserver =
      contained && "ResizeObserver" in window
        ? new ResizeObserver(resize)
        : null;
    if (resizeObserver) resizeObserver.observe(host);
    else window.addEventListener("resize", resize);

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [trailEnabled, trailEffect, trailColor, contained]);

  if (!customCursor && !trailEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`${
        contained ? "absolute" : "fixed"
      } inset-0 z-60 h-full w-full pointer-events-none`}
    />
  );
}
