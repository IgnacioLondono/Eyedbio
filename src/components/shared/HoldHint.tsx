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
import { useI18n } from "@/components/providers/LocaleProvider";

const HOLD_MS = 420;

type HintState = {
  label: string;
  description?: string;
  x: number;
  y: number;
  anchorBottom: number;
};

type HoldHintProps = {
  label: string;
  description?: string;
  showReleaseHint?: boolean;
  disabled?: boolean;
  children: ReactElement;
};

function mergeRef<T>(node: T, ref: Ref<T> | undefined) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as MutableRefObject<T | null>).current = node;
}

function HoldHintBubble({
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
      className="pointer-events-none fixed z-[220] flex flex-col items-center"
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

export function HoldHint({
  label,
  description,
  showReleaseHint = true,
  disabled = false,
  children,
}: HoldHintProps) {
  const { t } = useI18n();
  const [hint, setHint] = useState<HintState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blockClickRef = useRef(false);
  const hintVisibleRef = useRef(false);

  const resolvedDescription =
    description ?? (showReleaseHint ? t("common.holdHintRelease") : undefined);

  const clearHoldTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hideHint = useCallback(() => {
    hintVisibleRef.current = false;
    setHint(null);
  }, []);

  useEffect(() => () => clearHoldTimer(), [clearHoldTimer]);

  const child = children as ReactElement<{
    onPointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerUp?: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerLeave?: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel?: (event: React.PointerEvent<HTMLElement>) => void;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    onContextMenu?: (event: React.MouseEvent<HTMLElement>) => void;
    ref?: React.Ref<HTMLElement>;
  }>;

  return (
    <>
      {cloneElement(child, {
        onPointerDown: (event) => {
          child.props.onPointerDown?.(event);
          if (disabled || event.button !== 0) return;

          const target = event.currentTarget;
          const rect = target.getBoundingClientRect();
          clearHoldTimer();
          blockClickRef.current = false;

          timerRef.current = setTimeout(() => {
            hintVisibleRef.current = true;
            setHint({
              label,
              description: resolvedDescription,
              x: rect.left + rect.width / 2,
              y: rect.top,
              anchorBottom: rect.bottom,
            });
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate(12);
            }
          }, HOLD_MS);
        },
        onPointerUp: (event) => {
          child.props.onPointerUp?.(event);
          clearHoldTimer();
          if (hintVisibleRef.current) {
            blockClickRef.current = true;
          }
          hideHint();
        },
        onPointerLeave: (event) => {
          child.props.onPointerLeave?.(event);
          clearHoldTimer();
          hideHint();
        },
        onPointerCancel: (event) => {
          child.props.onPointerCancel?.(event);
          clearHoldTimer();
          hideHint();
        },
        onClick: (event) => {
          if (blockClickRef.current) {
            blockClickRef.current = false;
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          child.props.onClick?.(event);
        },
        onContextMenu: (event) => {
          event.preventDefault();
          child.props.onContextMenu?.(event);
        },
        ref: (node: HTMLElement | null) => {
          mergeRef(node, (child as { ref?: Ref<HTMLElement> }).ref);
        },
      })}
      {hint && typeof document !== "undefined"
        ? createPortal(
            <HoldHintBubble
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

export function HoldHintTarget({
  label,
  description,
  showReleaseHint,
  disabled,
  className = "",
  children,
}: {
  label: string;
  description?: string;
  showReleaseHint?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <HoldHint
      label={label}
      description={description}
      showReleaseHint={showReleaseHint}
      disabled={disabled}
    >
      <span className={`inline-flex ${className}`}>{children}</span>
    </HoldHint>
  );
}
