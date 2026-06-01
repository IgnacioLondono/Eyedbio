import bcrypt from "bcryptjs";
import { ensureAdminEnvLoaded } from "@/lib/load-admin-env";
import { prisma } from "@/lib/prisma";
import { USER_ROLE_ADMIN } from "@/lib/roles";
import { normalizeEmail, normalizeUsername, validateUsername } from "@/lib/validation";

function readEnvValue(value: string | undefined): string | null {
  if (!value?.trim()) return null;

  let trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  return trimmed || null;
}

export function getAdminEnvEmail(): string | null {
  ensureAdminEnvLoaded();
  const raw = readEnvValue(process.env.ADMIN_EMAIL);
  return raw ? normalizeEmail(raw) : null;
}

export function getAdminEnvPassword(): string | null {
  ensureAdminEnvLoaded();
  return readEnvValue(process.env.ADMIN_PASSWORD);
}

export function isAdminEnvEmail(email: string): boolean {
  const adminEmail = getAdminEnvEmail();
  return Boolean(adminEmail && adminEmail === normalizeEmail(email));
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminEnvEmail() && getAdminEnvPassword());
}

export function maskAdminEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length < 2) return "***";
  return `${local[0]}***${local.slice(-1)}@${domain}`;
}

export async function syncAdminUserRecord(userId: string, password: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      role: USER_ROLE_ADMIN,
      passwordHash: await bcrypt.hash(password, 12),
      blockedAt: null,
      blockedReason: null,
    },
  });
}

async function createAdminUser(email: string, password: string) {
  let username = normalizeUsername(readEnvValue(process.env.ADMIN_USERNAME) || "admin");
  if (validateUsername(username)) {
    username = `admin${Date.now().toString(36).slice(-4)}`;
  }

  let finalUsername = username;
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = await prisma.user.findUnique({ where: { username: finalUsername } });
    if (!taken) break;
    finalUsername = `${username}${attempt + 1}`;
  }

  return prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      username: finalUsername,
      displayName: "Administrador",
      role: USER_ROLE_ADMIN,
    },
  });
}

/**
 * Si el email es el del admin en .env, crea/actualiza la cuenta con ADMIN_PASSWORD
 * antes de validar la contraseña escrita por el usuario.
 */
export async function syncAdminFromEnvIfEmail(email: string) {
  const adminEmail = getAdminEnvEmail();
  const adminPassword = getAdminEnvPassword();
  if (!adminEmail || !adminPassword || adminEmail !== normalizeEmail(email)) {
    return null;
  }

  const normalized = normalizeEmail(email);
  const existing = await prisma.user.findUnique({ where: { email: normalized } });

  if (existing) {
    await syncAdminUserRecord(existing.id, adminPassword);
    return prisma.user.findUnique({ where: { email: normalized } });
  }

  return createAdminUser(normalized, adminPassword);
}

export async function ensureAdminUserForLogin(email: string, password: string) {
  const adminPassword = getAdminEnvPassword();
  if (!isAdminEnvEmail(email) || !adminPassword || password !== adminPassword) {
    return null;
  }

  return syncAdminFromEnvIfEmail(email);
}
