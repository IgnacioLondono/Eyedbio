export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "").trim();
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;

  if (full.length !== 6) {
    return `rgba(255,255,255,${alpha})`;
  }

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  if ([r, g, b].some(Number.isNaN)) {
    return `rgba(255,255,255,${alpha})`;
  }

  return `rgba(${r},${g},${b},${alpha})`;
}
