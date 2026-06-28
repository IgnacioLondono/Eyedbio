"use client";

import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "w-3.5 h-3.5 gap-0.5",
  md: "w-5 h-5 gap-1",
  lg: "w-6 h-6 gap-1",
};

export default function StarRating({
  value,
  onChange,
  size = "md",
  className = "",
  label,
}: Props) {
  const interactive = typeof onChange === "function";
  const stars = [1, 2, 3, 4, 5];

  const iconClass = sizeClasses[size].split(" ")[0];

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={label ?? `Valoración: ${value} de 5 estrellas`}
    >
      {stars.map((star) => {
        const filled = star <= value;

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="cursor-pointer transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 rounded p-0.5"
              aria-label={`${star} estrellas`}
            >
              <Star
                className={`${iconClass} ${
                  filled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-white/25"
                } transition-colors`}
              />
            </button>
          );
        }

        return (
          <Star
            key={star}
            className={`${iconClass} ${
              filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-white/25"
            }`}
          />
        );
      })}
    </div>
  );
}
