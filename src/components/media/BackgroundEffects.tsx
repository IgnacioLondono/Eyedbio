"use client";

import { useEffect, useRef } from "react";
import { BackgroundEffect } from "@/types/profile";

interface Props {
  effect: BackgroundEffect;
  contained?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift?: number;
  hue?: number;
  vx?: number;
  vy?: number;
  life?: number;
  angle?: number;
}

function countFor(effect: BackgroundEffect, contained: boolean): number {
  const m = contained ? 0.42 : 1;
  const map: Partial<Record<BackgroundEffect, number>> = {
    stars: 120,
    snow: 80,
    rain: 100,
    aurora: 36,
    fireflies: 65,
    bubbles: 55,
    nebula: 28,
    galaxy: 140,
    comets: 18,
    meteors: 35,
    cosmic_dust: 160,
    satellites: 12,
  };
  return Math.max(8, Math.round((map[effect] ?? 60) * m));
}

function spawnParticle(effect: BackgroundEffect, w: number, h: number): Particle {
  const base: Particle = {
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.7 + 0.2,
    drift: Math.random() * 2 - 1,
    hue: 190 + Math.random() * 120,
  };

  switch (effect) {
    case "aurora":
    case "nebula":
      return {
        ...base,
        size: Math.random() * 180 + 100,
        speed: Math.random() * 0.6 + 0.15,
        opacity: Math.random() * 0.22 + 0.08,
        hue: effect === "nebula" ? 260 + Math.random() * 80 : 180 + Math.random() * 120,
      };
    case "fireflies":
      return {
        ...base,
        size: Math.random() * 2.2 + 0.8,
        hue: 45 + Math.random() * 30,
      };
    case "bubbles":
      return {
        ...base,
        size: Math.random() * 14 + 4,
        speed: Math.random() * 0.8 + 0.3,
        opacity: Math.random() * 0.35 + 0.1,
      };
    case "comets":
      return {
        x: Math.random() * w,
        y: -20,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 4 + 3,
        opacity: Math.random() * 0.5 + 0.4,
        vx: Math.random() * 2 + 1,
        vy: Math.random() * 3 + 2,
        hue: 200 + Math.random() * 40,
      };
    case "meteors":
      return {
        x: Math.random() * w * 1.2,
        y: -30,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 8 + 6,
        opacity: 0,
        life: 0,
        vx: -(Math.random() * 4 + 3),
        vy: Math.random() * 6 + 5,
      };
    case "galaxy": {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.min(w, h) * 0.45;
      return {
        x: w / 2 + Math.cos(angle) * dist,
        y: h / 2 + Math.sin(angle) * dist,
        size: Math.random() * 1.8 + 0.4,
        speed: Math.random() * 0.02 + 0.005,
        opacity: Math.random() * 0.8 + 0.2,
        angle,
        drift: dist,
      };
    }
    case "cosmic_dust":
      return {
        ...base,
        size: Math.random() * 1.2 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        opacity: Math.random() * 0.4 + 0.1,
        hue: 220 + Math.random() * 60,
      };
    case "satellites": {
      const angle = Math.random() * Math.PI * 2;
      const orbit = Math.min(w, h) * (0.2 + Math.random() * 0.25);
      return {
        x: w / 2,
        y: h / 2,
        size: Math.random() * 2 + 1.5,
        speed: (Math.random() * 0.015 + 0.006) * (Math.random() > 0.5 ? 1 : -1),
        opacity: Math.random() * 0.6 + 0.35,
        angle,
        drift: orbit,
      };
    }
    default:
      return {
        ...base,
        size: effect === "stars" ? Math.random() * 2 + 0.5 : Math.random() * 3 + 1,
      };
  }
}

function resetParticle(p: Particle, effect: BackgroundEffect, w: number, h: number) {
  const fresh = spawnParticle(effect, w, h);
  Object.assign(p, fresh);
}

export default function BackgroundEffects({ effect, contained = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (effect === "none") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let particles: Particle[] = [];
    let running = false;
    let tick = 0;

    const resize = () => {
      const width = contained ? canvas.offsetWidth : window.innerWidth;
      const height = contained ? canvas.offsetHeight : window.innerHeight;
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);
    };

    const initParticles = () => {
      const n = countFor(effect, contained);
      particles = Array.from({ length: n }, () => spawnParticle(effect, canvas.width, canvas.height));
    };

    const drawSoftBlob = (p: Particle, alpha: number) => {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      gradient.addColorStop(0, `hsla(${p.hue ?? 190}, 85%, 62%, ${alpha})`);
      gradient.addColorStop(1, `hsla(${p.hue ?? 190}, 85%, 62%, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
    };

    const draw = () => {
      if (!running) return;
      tick += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.globalAlpha = p.opacity;

        switch (effect) {
          case "stars":
            ctx.fillStyle = "#ffffff";
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.opacity += (Math.random() - 0.5) * 0.05;
            p.opacity = Math.max(0.1, Math.min(1, p.opacity));
            break;

          case "snow":
            ctx.fillStyle = "#ffffff";
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.speed * 0.5;
            p.x += (p.drift ?? 0) * 0.3;
            if (p.y > h) resetParticle(p, effect, w, h);
            break;

          case "rain":
            ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (p.drift ?? 0), p.y + p.size * 8);
            ctx.stroke();
            p.y += p.speed * 4;
            if (p.y > h) resetParticle(p, effect, w, h);
            break;

          case "aurora":
          case "nebula":
            drawSoftBlob(p, p.opacity);
            p.x += (p.drift ?? 0) * 0.12;
            p.y += Math.sin((p.x + p.y + tick) * 0.002) * 0.25;
            if (p.x < -p.size) p.x = w + p.size;
            if (p.x > w + p.size) p.x = -p.size;
            break;

          case "fireflies":
            ctx.fillStyle = `hsla(${p.hue ?? 55}, 95%, 65%, ${p.opacity})`;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.x += (p.drift ?? 0) * 0.5;
            p.y += (Math.random() - 0.5) * 0.6;
            p.opacity += (Math.random() - 0.5) * 0.06;
            p.opacity = Math.max(0.12, Math.min(0.95, p.opacity));
            if (p.x > w + 10) p.x = -10;
            if (p.x < -10) p.x = w + 10;
            if (p.y > h + 10) p.y = -10;
            if (p.y < -10) p.y = h + 10;
            break;

          case "bubbles":
            ctx.strokeStyle = `rgba(200, 220, 255, ${p.opacity})`;
            ctx.fillStyle = `rgba(150, 180, 255, ${p.opacity * 0.15})`;
            ctx.lineWidth = 1;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            p.y -= p.speed * 0.6;
            p.x += Math.sin(tick * 0.02 + p.y * 0.01) * 0.3;
            if (p.y < -p.size) {
              p.y = h + p.size;
              p.x = Math.random() * w;
            }
            break;

          case "comets": {
            const vx = p.vx ?? 2;
            const vy = p.vy ?? 3;
            const tail = p.size * 12;
            ctx.strokeStyle = `hsla(${p.hue ?? 210}, 90%, 75%, ${p.opacity})`;
            ctx.lineWidth = p.size;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - vx * tail * 0.15, p.y - vy * tail * 0.15);
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.x += vx;
            p.y += vy;
            if (p.y > h + 20 || p.x > w + 20) resetParticle(p, effect, w, h);
            break;
          }

          case "meteors": {
            if ((p.life ?? 0) <= 0 && Math.random() < 0.02) {
              p.life = 1;
              p.opacity = Math.random() * 0.5 + 0.5;
              p.x = Math.random() * w;
              p.y = -10;
            }
            if ((p.life ?? 0) > 0) {
              const vx = p.vx ?? -4;
              const vy = p.vy ?? 6;
              ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x - vx * 3, p.y - vy * 3);
              ctx.stroke();
              p.x += vx;
              p.y += vy;
              p.life = (p.life ?? 1) - 0.02;
              if (p.y > h || p.x < 0) p.life = 0;
            }
            break;
          }

          case "galaxy": {
            const angle = (p.angle ?? 0) + p.speed;
            const dist = p.drift ?? 50;
            p.angle = angle;
            p.x = cx + Math.cos(angle) * dist;
            p.y = cy + Math.sin(angle) * dist * 0.55;
            ctx.fillStyle = `hsla(${280 + dist * 0.05}, 70%, 80%, ${p.opacity})`;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          }

          case "cosmic_dust":
            ctx.fillStyle = `hsla(${p.hue ?? 240}, 60%, 85%, ${p.opacity})`;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.x += (p.drift ?? 0) * 0.08;
            p.y -= p.speed * 0.15;
            if (p.y < -5) p.y = h + 5;
            if (p.x > w + 5) p.x = -5;
            if (p.x < -5) p.x = w + 5;
            break;

          case "satellites": {
            const angle = (p.angle ?? 0) + p.speed;
            const orbit = p.drift ?? 100;
            p.angle = angle;
            p.x = cx + Math.cos(angle) * orbit;
            p.y = cy + Math.sin(angle) * orbit * 0.65;
            ctx.fillStyle = `rgba(220, 230, 255, ${p.opacity})`;
            ctx.fillRect(p.x - p.size, p.y - p.size * 0.4, p.size * 2, p.size * 0.8);
            if (Math.random() < 0.003) {
              ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.5})`;
              ctx.fillRect(p.x - 1, p.y - 8, 2, 16);
            }
            break;
          }

          default:
            break;
        }
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    const start = () => {
      resize();
      if (canvas.width <= 1 || canvas.height <= 1) {
        requestAnimationFrame(start);
        return;
      }
      initParticles();
      running = true;
      draw();
    };

    start();

    const handleResize = () => {
      resize();
      if (canvas.width > 1 && canvas.height > 1) initParticles();
    };

    window.addEventListener("resize", handleResize);
    const observeTarget = contained ? canvas.parentElement : null;
    const observer =
      contained && observeTarget && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(handleResize)
        : null;
    observeTarget && observer?.observe(observeTarget);

    return () => {
      running = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [effect, contained]);

  if (effect === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className={`${contained ? "absolute inset-0 h-full w-full" : "fixed inset-0"} pointer-events-none z-[1]`}
      aria-hidden="true"
    />
  );
}
