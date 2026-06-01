import { randomUUID } from "crypto";

export const GUEST_VIEWER_COOKIE = "eyed_guest_id";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseGuestIdFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${GUEST_VIEWER_COOKIE}=([^;]+)`));
  if (!match?.[1]) return null;

  const value = decodeURIComponent(match[1].trim());
  return value.length >= 8 && value.length <= 64 ? value : null;
}

export function resolveGuestViewer(cookieHeader: string | null): {
  guestId: string;
  shouldSetCookie: boolean;
} {
  const existing = parseGuestIdFromCookieHeader(cookieHeader);
  if (existing) {
    return { guestId: existing, shouldSetCookie: false };
  }

  return { guestId: randomUUID(), shouldSetCookie: true };
}

export function guestViewerCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}
