"use client";

import type { CSSProperties } from "react";
import type { NameAnimation } from "@/types/profile";
import { getNameAnimationClass } from "@/lib/name-animations";

interface Props {
  text: string;
  animation: NameAnimation;
  className?: string;
  style?: CSSProperties;
}

export default function AnimatedDisplayName({
  text,
  animation,
  className = "",
  style,
}: Props) {
  const animClass = getNameAnimationClass(animation);

  if (animation === "none" || !animClass) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    );
  }

  if (animation === "shimmer") {
    return (
      <span
        className={`${className} ${animClass} inline-block`}
        style={style}
        data-text={text}
      >
        {text}
      </span>
    );
  }

  return (
    <span className={`${className} ${animClass} inline-block`} style={style}>
      {Array.from(text).map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="name-anim-char inline-block"
          style={{ animationDelay: `${index * 0.07}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
