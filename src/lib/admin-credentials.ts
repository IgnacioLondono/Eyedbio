import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { USER_ROLE_ADMIN } from "@/lib/roles";
import { normalizeEmail, normalizeUsername, validateUsername } from "@/lib/validation";

export function getAdminEnvEmail(): string | null {
  const raw = process.env.ADMIN_EMAIL?.trim();
  return raw ? normalizeEmail(raw) : null;
}

export function matchesAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

export function isAdminLoginAttempt(email: string, password: string): boolean {
  const adminEmail = getAdminEnvEmail();
  if (!adminEmail) return false;
  return adminEmail === normalizeEmail(email) && matchesAdminPassword(password);
}

/** Acepta ADMIN_PASSWORD aunque el hash en BD aún no coincida; sincroniza rol y hash. */
export async function verifyLoginPassword(
  user: { id: string; passwordHash: string },
  email: string,
  password: string
): Promise<boolean> {
  if (isAdminLoginAttempt(email, password)) {
    await syncAdminUserRecord(user.id, password);
    return true;
  }

  return bcrypt.compare(password, user.passwordHash);
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

/** Si no existe cuenta pero las credenciales coinciden con el .env, créala. */
export async function ensureAdminUserForLogin(email: string, password: string) {
  if (!isAdminLoginAttempt(email, password)) return null;

  const normalized = normalizeEmail(email);
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    await syncAdminUserRecord(existing.id, password);
    return existing;
  }

  let username = normalizeUsername(process.env.ADMIN_USERNAME?.trim() || "admin");
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
      email: normalized,
      passwordHash: await bcrypt.hash(password, 12),
      username: finalUsername,
      displayName: "Administrador",
      role: USER_ROLE_ADMIN,
    },
  });
}
