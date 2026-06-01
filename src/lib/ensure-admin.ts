import { prisma } from "@/lib/prisma";
import {
  getAdminEnvEmail,
  getAdminEnvPassword,
  isAdminConfigured,
  syncAdminFromEnvIfEmail,
} from "@/lib/admin-credentials";

export async function ensureAdminFromEnv(): Promise<void> {
  const email = getAdminEnvEmail();
  const password = getAdminEnvPassword();

  if (!isAdminConfigured() || !email || !password) {
    console.log("[ensure-admin] ADMIN_EMAIL / ADMIN_PASSWORD no configurados — omitido");
    return;
  }

  const user = await syncAdminFromEnvIfEmail(email);
  if (user) {
    console.log(`[ensure-admin] Cuenta admin lista: ${email} (@${user.username})`);
  }
}
