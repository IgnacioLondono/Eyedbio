import type { NameAnimation } from "@/types/profile";

export const NAME_ANIMATION_OPTIONS: { value: NameAnimation; label: string }[] = [
  { value: "none", label: "Ninguna" },
  { value: "typewriter", label: "Máquina de escribir" },
  { value: "wave", label: "Ola" },
  { value: "bounce", label: "Rebote" },
  { value: "shimmer", label: "Brillo móvil" },
  { value: "glitch", label: "Glitch" },
];

export function resolveNameAnimation(
  settings: { nameAnimation?: NameAnimation }
): NameAnimation {
  return settings.nameAnimation ?? "none";
}

export function getNameAnimationClass(animation: NameAnimation): string | undefined {
  switch (animation) {
    case "typewriter":
      return "name-anim-typewriter";
    case "wave":
      return "name-anim-wave";
    case "bounce":
      return "name-anim-bounce";
    case "shimmer":
      return "name-anim-shimmer";
    case "glitch":
      return "name-anim-glitch";
    default:
      return undefined;
  }
}
