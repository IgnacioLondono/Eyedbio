import type { CSSProperties } from "react";
import { NameEffect } from "@/types/profile";

export const NAME_EFFECT_OPTIONS: { value: NameEffect; label: string }[] = [
  { value: "none", label: "Ninguno" },
  { value: "glow", label: "Brillo" },
  { value: "aura", label: "Aura" },
  { value: "neon", label: "Neón" },
  { value: "pulse", label: "Pulso" },
  { value: "gradient", label: "Gradiente" },
];

export function resolveNameEffect(
  settings: { nameEffect?: NameEffect; glowUsername?: boolean }
): NameEffect {
  if (settings.nameEffect) return settings.nameEffect;
  return settings.glowUsername === false ? "none" : "glow";
}

export function getNameEffectClass(effect: NameEffect): string | undefined {
  if (effect === "pulse") return "name-effect-pulse";
  if (effect === "gradient") return "name-effect-gradient";
  return undefined;
}

export function getNameEffectStyle(
  effect: NameEffect,
  accentColor: string,
  textColor: string
): CSSProperties {
  switch (effect) {
    case "glow":
      return {
        textShadow: `0 0 12px ${accentColor}, 0 0 24px ${accentColor}88`,
      };
    case "aura":
      return {
        textShadow: [
          `0 0 4px ${textColor}`,
          `0 0 12px ${accentColor}`,
          `0 0 24px ${accentColor}cc`,
          `0 0 48px ${accentColor}66`,
          `0 0 72px ${accentColor}33`,
        ].join(", "),
      };
    case "neon":
      return {
        textShadow: [
          `0 0 2px ${textColor}`,
          `0 0 6px ${textColor}`,
          `0 0 14px ${accentColor}`,
          `0 0 28px ${accentColor}`,
          `0 0 42px ${accentColor}aa`,
        ].join(", "),
      };
    case "pulse":
      return {
        ["--name-glow-color" as string]: accentColor,
      };
    case "gradient":
      return {
        backgroundImage: `linear-gradient(135deg, ${textColor} 0%, ${accentColor} 50%, ${textColor} 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: `drop-shadow(0 0 12px ${accentColor}88)`,
      };
    default:
      return {};
  }
}

export function getAvatarGlowStyle(
  effect: NameEffect,
  accentColor: string
): CSSProperties | undefined {
  if (effect === "none") return undefined;

  const intensity =
    effect === "aura" ? "0 0 40px" : effect === "neon" ? "0 0 36px" : "0 0 30px";

  return {
    boxShadow: `${intensity} ${accentColor}${effect === "pulse" ? "88" : "66"}`,
  };
}
