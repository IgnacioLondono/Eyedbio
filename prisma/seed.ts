import "dotenv/config";
import { ensureOfficialTemplates } from "../src/lib/templates/template-service";

async function main() {
  await ensureOfficialTemplates();
  console.log("Seeded official profile templates.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    // prisma disconnect handled by process exit
  });
