export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { loadAdminEnvFromFile } = await import("@/lib/load-admin-env");
    loadAdminEnvFromFile();

    const { ensureAdminFromEnv } = await import("@/lib/auth/ensure-admin");
    await ensureAdminFromEnv().catch((err) => {
      console.error("[instrumentation] ensure-admin failed:", err);
    });
  }
}
