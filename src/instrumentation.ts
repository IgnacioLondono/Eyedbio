export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureAdminFromEnv } = await import("@/lib/ensure-admin");
    await ensureAdminFromEnv().catch((err) => {
      console.error("[instrumentation] ensure-admin failed:", err);
    });
  }
}
