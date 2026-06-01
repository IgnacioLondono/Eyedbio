import "dotenv/config";
import { ensureAdminFromEnv } from "../src/lib/ensure-admin";

ensureAdminFromEnv()
  .catch((err) => {
    console.error("[ensure-admin] Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
