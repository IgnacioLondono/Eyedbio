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

    const resize = () => {
      const width = contained ? canvas.offsetWidth : window.innerWidth;
      const height = contained ? canvas.offsetHeight : window.innerHeight;
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);
    };

    const initParticles = () => {
      const count = contained
        ? effect === "stars"
          ? 50
          : effect === "snow"
            ? 35
            : effect === "aurora"
              ? 18
              : effect === "fireflies"
                ? 28
                : 45
        : effect === "stars"
          ? 120
          : effect === "snow"
            ? 80
            : effect === "aurora"
              ? 36
              : effect === "fireflies"
                ? 65
                : 100;

      particles = Array.from({ length: count }, () => {
        if (effect === "aurora") {
          return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.8,
            size: Math.random() * 200 + 140,
            speed: Math.random() * 0.8 + 0.2,
            opacity: Math.random() * 0.25 + 0.1,
            drift: Math.random() * 0.8 - 0.4,
            hue: 180 + Math.random() * 120,
          };
        }

        if (effect === "fireflies") {
          return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2.2 + 0.8,
            speed: Math.random() * 0.8 + 0.2,
            opacity: Math.random() * 0.6 + 0.2,
            drift: Math.random() * 2 - 1,
            hue: 45 + Math.random() * 30,
          };
        }

        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: effect === "stars" ? Math.random() * 2 + 0.5 : Math.random() * 3 + 1,
          speed: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          drift: Math.random() * 2 - 1,
        };
      });
    };

    const draw = () => {
      if (!running) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.globalAlpha = p.opacity;

        if (effect === "stars") {
          ctx.fillStyle = "#ffffff";
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          p.opacity += (Math.random() - 0.5) * 0.05;
          p.opacity = Math.max(0.1, Math.min(1, p.opacity));
        } else if (effect === "snow") {
          ctx.fillStyle = "#ffffff";
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.speed * 0.5;
          p.x += (p.drift ?? 0) * 0.3;
          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
        } else if (effect === "rain") {
          ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + (p.drift ?? 0), p.y + p.size * 8);
          ctx.stroke();
          p.y += p.speed * 4;
          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
        } else if (effect === "aurora") {
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.size
          );
          gradient.addColorStop(0, `hsla(${p.hue ?? 190}, 80%, 65%, ${p.opacity})`);
          gradient.addColorStop(1, `hsla(${p.hue ?? 190}, 80%, 65%, 0)`);
          ctx.fillStyle = gradient;
          ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);

          p.x += (p.drift ?? 0) * 0.15;
          p.y += Math.sin((p.x + p.y) * 0.002) * 0.2;
          if (p.x < -p.size) p.x = canvas.width + p.size;
          if (p.x > canvas.width + p.size) p.x = -p.size;
        } else if (effect === "fireflies") {
          ctx.fillStyle = `hsla(${p.hue ?? 55}, 95%, 65%, ${p.opacity})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += (p.drift ?? 0) * 0.5;
          p.y += (Math.random() - 0.5) * 0.6;
          p.opacity += (Math.random() - 0.5) * 0.06;
          p.opacity = Math.max(0.12, Math.min(0.95, p.opacity));
          if (p.x > canvas.width + 10) p.x = -10;
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.y > canvas.height + 10) p.y = -10;
          if (p.y < -10) p.y = canvas.height + 10;
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
      if (canvas.width > 1 && canvas.height > 1) {
        initParticles();
      }
    };

    window.addEventListener("resize", handleResize);
    const observeTarget = contained ? canvas.parentElement : null;
    const observer =
      contained && observeTarget && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(handleResize)
        : null;
    if (observeTarget) observer?.observe(observeTarget);

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
