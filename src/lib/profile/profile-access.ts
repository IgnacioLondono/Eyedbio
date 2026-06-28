import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

export const PROFILE_UNLOCK_COOKIE_PREFIX = "eyed_unlock_";

export function profileUnlockCookieName(username: string): string {
  return `${PROFILE_UNLOCK_COOKIE_PREFIX}${username.toLowerCase()}`;
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET no está configurado");
  }
  return secret;
}

export function signProfileUnlockToken(userId: string, username: string): string {
  return createHmac("sha256", getSecret())
    .update(`profile-unlock:${userId}:${username.toLowerCase()}`)
    .digest("base64url");
}

export function verifyProfileUnlockToken(
  token: string | undefined,
  userId: string,
  username: string
): boolean {
  if (!token) return false;

  const expected = signProfileUnlockToken(userId, username);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function verifyAccessCode(
  code: string,
  accessCodeHash: string | null | undefined
): Promise<boolean> {
  if (!accessCodeHash) return false;
  return bcrypt.compare(code, accessCodeHash);
}

export async function hashAccessCode(code: string): Promise<string> {
  return bcrypt.hash(code, 12);
}
