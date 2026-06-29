import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const LINK_COOKIE = "eyed_discord_link";
const RESTORE_COOKIE = "eyed_discord_restore";
const MAX_AGE_SEC = 600;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is required for Discord linking");
  return secret;
}

function sign(userId: string, ts: number): string {
  return createHmac("sha256", getSecret()).update(`${userId}.${ts}`).digest("hex");
}

export function packDiscordLinkState(userId: string): string {
  const ts = Date.now();
  return `${userId}.${ts}.${sign(userId, ts)}`;
}

export function unpackDiscordLinkState(value: string): string | null {
  return unpack(value);
}

function unpack(value: string | undefined): string | null {
  if (!value) return null;

  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [userId, tsRaw, sig] = parts;
  const ts = Number(tsRaw);
  if (!userId || !sig || !Number.isFinite(ts)) return null;
  if (Date.now() - ts > MAX_AGE_SEC * 1000) return null;

  const expected = sign(userId, ts);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  return userId;
}

export async function setDiscordLinkIntent(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(LINK_COOKIE, packDiscordLinkState(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SEC,
    path: "/",
  });
}

export async function consumeDiscordLinkIntent(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(LINK_COOKIE)?.value;
  jar.delete(LINK_COOKIE);
  return unpack(value);
}

export async function setDiscordLinkSessionRestore(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(RESTORE_COOKIE, packDiscordLinkState(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SEC,
    path: "/",
  });
}

export async function readDiscordLinkSessionRestore(): Promise<string | null> {
  const jar = await cookies();
  return unpack(jar.get(RESTORE_COOKIE)?.value);
}

export async function consumeDiscordLinkSessionRestore(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(RESTORE_COOKIE)?.value;
  jar.delete(RESTORE_COOKIE);
  return unpack(value);
}
