import "dotenv/config";
import { ensureAdminFromEnv } from "../src/lib/auth/ensure-admin";

async function main() {
  await ensureAdminFromEnv();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[ensure-admin] Error:", err);
    process.exit(1);
  });
