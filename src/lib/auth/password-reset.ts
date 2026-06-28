import { randomInt } from "crypto";

export function createVerificationCode(): string {
  return String(randomInt(100000, 1000000));
}

export function getCodeExpiry(minutes = 15): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function normalizeVerificationCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 6);
}

export function isValidVerificationCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}
