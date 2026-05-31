"use client";

import { useEffect, useRef } from "react";
import { BackgroundEffect } from "@/types/profile";

interface Props {
  effect: BackgroundEffect;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift?: number;
}

export default function BackgroundEffects({ effect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (effect === "none") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const count = effect === "stars" ? 120 : effect === "snow" ? 80 : 100;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: effect === "stars" ? Math.random() * 2 + 0.5 : Math.random() * 3 + 1,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        drift: Math.random() * 2 - 1,
      }));
    };

    const draw = () => {
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
        }
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [effect]);

  if (effect === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      aria-hidden="true"
    />
  );
}
