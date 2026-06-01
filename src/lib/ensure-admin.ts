import { prisma } from "@/lib/prisma";
import {
  ensureAdminUserForLogin,
  getAdminEnvEmail,
  matchesAdminPassword,
} from "@/lib/admin-credentials";

export async function ensureAdminFromEnv(): Promise<void> {
  const email = getAdminEnvEmail();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("[ensure-admin] ADMIN_EMAIL / ADMIN_PASSWORD no configurados — omitido");
    return;
  }

  const user = await ensureAdminUserForLogin(email, password);
  if (user) {
    console.log(`[ensure-admin] Cuenta admin lista: ${email} (@${user.username})`);
    return;
  }

  if (!matchesAdminPassword(password)) {
    console.log("[ensure-admin] No se pudo validar ADMIN_PASSWORD");
  }
}
