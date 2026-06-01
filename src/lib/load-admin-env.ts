import { readFileSync } from "fs";

const DEFAULT_ADMIN_ENV_PATHS = ["/data/admin.env", "/app/admin.env"];

let loaded = false;

function parseEnvLine(line: string): { key: string; value: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const withoutExport = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
  const eq = withoutExport.indexOf("=");
  if (eq <= 0) return null;

  const key = withoutExport.slice(0, eq).trim();
  let value = withoutExport.slice(eq + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

/**
 * Carga ADMIN_* desde archivo si no están en process.env (útil en Portainer).
 * Rutas: ADMIN_ENV_FILE, /data/admin.env, /app/admin.env
 */
export function loadAdminEnvFromFile(): boolean {
  if (loaded) return false;
  loaded = true;

  const paths = [
    process.env.ADMIN_ENV_FILE?.trim(),
    ...DEFAULT_ADMIN_ENV_PATHS,
  ].filter((path): path is string => Boolean(path));

  for (const filePath of paths) {
    try {
      const content = readFileSync(filePath, "utf8");
      let applied = 0;

      for (const line of content.split(/\r?\n/)) {
        const parsed = parseEnvLine(line);
        if (!parsed) continue;

        if (!["ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_USERNAME"].includes(parsed.key)) {
          continue;
        }

        if (!process.env[parsed.key]) {
          process.env[parsed.key] = parsed.value;
          applied += 1;
        }
      }

      if (applied > 0) {
        console.log(`[admin-env] Cargadas ${applied} variables desde ${filePath}`);
        return true;
      }
    } catch {
      // archivo opcional
    }
  }

  return false;
}

export function ensureAdminEnvLoaded() {
  loadAdminEnvFromFile();
}
