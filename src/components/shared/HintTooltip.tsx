"use client";

import {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

const HOVER_DELAY_MS = 80;

type HintState = {
  label: string;
  description?: string;
  x: number;
  y: number;
  anchorBottom: number;
};

type HintTooltipProps = {
  label: string;
  description?: string;
  disabled?: boolean;
  children: ReactElement;
};

function mergeRef<T>(node: T, ref: Ref<T> | undefined) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as MutableRefObject<T | null>).current = node;
}

function HintTooltipBubble({
  label,
  description,
  x,
  y,
  anchorBottom,
}: {
  label: string;
  description?: string;
  x: number;
  y: number;
  anchorBottom: number;
}) {
  const showBelow = y < 80;
  const left = Math.min(Math.max(x, 16), typeof window !== "undefined" ? window.innerWidth - 16 : x);

  return (
    <div
      className="pointer-events-none fixed z-[220] flex flex-col items-center animate-in fade-in zoom-in-95 duration-100"
      style={{
        left,
        top: showBelow ? anchorBottom + 10 : y - 10,
        transform: showBelow ? "translate(-50%, 0)" : "translate(-50%, -100%)",
      }}
      role="tooltip"
      aria-live="polite"
    >
      <div className="max-w-[min(280px,calc(100vw-2rem))] rounded-xl border border-white/15 bg-[#1a1a24]/96 px-3.5 py-2.5 shadow-2xl shadow-black/40 backdrop-blur-md">
        <p className="text-center text-sm font-semibold text-white">{label}</p>
        {description ? (
          <p className="mt-1 text-center text-xs leading-relaxed text-white/50">{description}</p>
        ) : null}
      </div>
      <div
        className={`h-2.5 w-2.5 shrink-0 border-white/15 bg-[#1a1a24]/96 ${
          showBelow
            ? "-mt-px rotate-45 border-l border-t"
            : "-mb-px rotate-45 border-b border-r"
        }`}
        aria-hidden
      />
    </div>
  );
}

export function HintTooltip({
  label,
  description,
  disabled = false,
  children,
}: HintTooltipProps) {
  const [hint, setHint] = useState<HintState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearShowTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hideHint = useCallback(() => {
    setHint(null);
  }, []);

  const openHint = useCallback(
    (target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      setHint({
        label,
        description,
        x: rect.left + rect.width / 2,
        y: rect.top,
        anchorBottom: rect.bottom,
      });
    },
    [description, label]
  );

  const scheduleHint = useCallback(
    (target: HTMLElement) => {
      clearShowTimer();
      timerRef.current = setTimeout(() => openHint(target), HOVER_DELAY_MS);
    },
    [clearShowTimer, openHint]
  );

  useEffect(() => () => clearShowTimer(), [clearShowTimer]);

  const child = children as ReactElement<{
    onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
    ref?: Ref<HTMLElement>;
  }>;

  return (
    <>
      {cloneElement(child, {
        onMouseEnter: (event) => {
          child.props.onMouseEnter?.(event);
          if (!disabled) scheduleHint(event.currentTarget);
        },
        onMouseLeave: (event) => {
          child.props.onMouseLeave?.(event);
          clearShowTimer();
          hideHint();
        },
        onFocus: (event) => {
          child.props.onFocus?.(event);
          if (!disabled) openHint(event.currentTarget);
        },
        onBlur: (event) => {
          child.props.onBlur?.(event);
          clearShowTimer();
          hideHint();
        },
        ref: (node: HTMLElement | null) => {
          mergeRef(node, (child as { ref?: Ref<HTMLElement> }).ref);
        },
      })}
      {hint && typeof document !== "undefined"
        ? createPortal(
            <HintTooltipBubble
              label={hint.label}
              description={hint.description}
              x={hint.x}
              y={hint.y}
              anchorBottom={hint.anchorBottom}
            />,
            document.body
          )
        : null}
    </>
  );
}

export function HintTooltipTarget({
  label,
  description,
  disabled,
  className = "",
  children,
}: {
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <HintTooltip label={label} description={description} disabled={disabled}>
      <span className={`inline-flex ${className}`}>{children}</span>
    </HintTooltip>
  );
}
