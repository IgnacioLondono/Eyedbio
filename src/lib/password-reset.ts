import { randomBytes } from "crypto";

export function createResetTokenValue(): string {
  return randomBytes(32).toString("hex");
}

export function getResetExpiry(hours = 1): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function getAppBaseUrl(): string {
  const url = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:9090";
  return url.replace(/\/$/, "");
}

export function buildResetPasswordUrl(token: string): string {
  return `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
}
