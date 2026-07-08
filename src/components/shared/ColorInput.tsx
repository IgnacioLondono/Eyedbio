"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 100;

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Si value está vacío, el selector muestra este color como referencia visual. */
  emptyFallback?: string;
  placeholder?: string;
  swatchClassName?: string;
  textClassName?: string;
  className?: string;
};

/**
 * Selector de color con estado local y debounce.
 * Evita congelar el dashboard cuando el cuentagotas del navegador dispara
 * decenas de eventos input por segundo (cada uno re-renderizaba la vista previa).
 */
export default function ColorInput({
  value,
  onChange,
  disabled = false,
  emptyFallback,
  placeholder,
  swatchClassName = "h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-white/10 bg-transparent",
  textClassName = "input-field flex-1 font-mono text-sm",
  className = "flex items-center gap-3",
}: Props) {
  const [local, setLocal] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localRef = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const swatchValue = local || emptyFallback || "#000000";

  useEffect(() => {
    setLocal(value);
    localRef.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const flush = useCallback((next: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    onChangeRef.current(next);
  }, []);

  const scheduleFlush = useCallback((next: string) => {
    localRef.current = next;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      onChangeRef.current(next);
    }, DEBOUNCE_MS);
  }, []);

  const handleSwatchInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const next = e.currentTarget.value;
      setLocal(next);
      scheduleFlush(next);
    },
    [scheduleFlush]
  );

  const handleSwatchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setLocal(next);
      localRef.current = next;
      flush(next);
    },
    [flush]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setLocal(next);
      scheduleFlush(next);
    },
    [scheduleFlush]
  );

  const handleTextBlur = useCallback(() => {
    flush(localRef.current);
  }, [flush]);

  return (
    <div className={`${className} ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      <input
        type="color"
        value={swatchValue}
        onInput={handleSwatchInput}
        onChange={handleSwatchChange}
        className={swatchClassName}
        disabled={disabled}
      />
      <input
        type="text"
        value={local}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        placeholder={placeholder}
        className={textClassName}
        disabled={disabled}
        spellCheck={false}
      />
    </div>
  );
}
