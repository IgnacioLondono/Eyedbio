/** Estado en history.state para la pantalla de entrada del perfil público. */
export const PROFILE_ENTERED_HISTORY_KEY = "eyedProfileEntered" as const;

type ProfileHistoryState = Record<string, unknown> & {
  [PROFILE_ENTERED_HISTORY_KEY]?: boolean;
};

export function readProfileEnteredFromHistory(): boolean {
  if (typeof window === "undefined") return false;
  const state = window.history.state as ProfileHistoryState | null;
  return Boolean(state?.[PROFILE_ENTERED_HISTORY_KEY]);
}

export function writeProfileEnteredHistory(entered: boolean, mode: "push" | "replace" = "push") {
  if (typeof window === "undefined") return;

  const prev = (window.history.state ?? {}) as ProfileHistoryState;
  const next: ProfileHistoryState = { ...prev, [PROFILE_ENTERED_HISTORY_KEY]: entered };
  const url = window.location.href;

  if (mode === "replace") {
    window.history.replaceState(next, "", url);
    return;
  }

  window.history.pushState(next, "", url);
}

export function pathsMatch(pathname: string, href: string): boolean {
  const target = href.split("?")[0]?.split("#")[0] || "/";
  if (target === "/") return pathname === "/";
  return pathname === target || pathname.startsWith(`${target}/`);
}
