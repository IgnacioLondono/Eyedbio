import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { USER_ROLE_ADMIN } from "@/lib/roles";
import { normalizeEmail, normalizeUsername, validateUsername } from "@/lib/validation";

export async function ensureAdminFromEnv(): Promise<void> {
  const emailRaw = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!emailRaw || !password) {
    console.log("[ensure-admin] ADMIN_EMAIL / ADMIN_PASSWORD no configurados — omitido");
    return;
  }

  const email = normalizeEmail(emailRaw);
  let username = normalizeUsername(process.env.ADMIN_USERNAME?.trim() || "admin");

  const usernameError = validateUsername(username);
  if (usernameError) {
    username = `admin${Date.now().toString(36).slice(-4)}`;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: USER_ROLE_ADMIN,
        passwordHash,
        blockedAt: null,
        blockedReason: null,
      },
    });
    console.log(`[ensure-admin] Cuenta admin actualizada: ${email}`);
    return;
  }

  let finalUsername = username;
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = await prisma.user.findUnique({ where: { username: finalUsername } });
    if (!taken) break;
    finalUsername = `${username}${attempt + 1}`;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      username: finalUsername,
      displayName: "Administrador",
      role: USER_ROLE_ADMIN,
    },
  });

  console.log(`[ensure-admin] Cuenta admin creada: ${email} (@${finalUsername})`);
}
