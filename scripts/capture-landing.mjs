// Captura las pantallas reales de la app (dashboard + perfil público) para la
// landing y las guarda en public/landing/.
//
// Uso (PowerShell):
//   $env:BASE_URL="http://localhost:9090"
//   $env:LOGIN_EMAIL="tu@email.com"
//   $env:LOGIN_PASSWORD="tuPassword"
//   $env:PROFILE_USERNAME="ignaciodrx908"   # perfil público a capturar
//   $env:LOCALE="es"                          # "es" o "en" (por defecto "es")
//   # opcional si tu cuenta pide código por email:
//   $env:LOGIN_CODE="123456"
//   # opcional para ver el navegador:
//   $env:HEADED="1"
//   node scripts/capture-landing.mjs
//
// Notas:
// - El idioma se fuerza con cookie + Accept-Language + interceptando el campo
//   "locale" de las respuestas de la API, SIN modificar tu cuenta.
// - LOCALE="es" sobrescribe los PNG base (dashboard-perfil.png, ...).
//   LOCALE="en" genera variantes con sufijo (dashboard-perfil-en.png, ...).

import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "..", "public", "landing");

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:9090").replace(/\/$/, "");
const LOGIN_EMAIL = process.env.LOGIN_EMAIL ?? "";
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD ?? "";
const LOGIN_CODE = process.env.LOGIN_CODE ?? "";
const PROFILE_USERNAME = process.env.PROFILE_USERNAME ?? "";
const HEADED = process.env.HEADED === "1";
const LOCALE = process.env.LOCALE === "en" ? "en" : "es";

const SUFFIX = LOCALE === "en" ? "-en" : "";
const ACCEPT_LANGUAGE =
  LOCALE === "en" ? "en-US,en;q=0.9" : "es-ES,es;q=0.9";
const CONTEXT_LOCALE = LOCALE === "en" ? "en-US" : "es-ES";

function withSuffix(file) {
  return file.replace(/\.png$/, `${SUFFIX}.png`);
}

const DASHBOARD_SHOTS = [
  { tab: "general", file: "dashboard-perfil.png" },
  { tab: "links", file: "dashboard-enlaces.png" },
  { tab: "media", file: "dashboard-media.png" },
  { tab: "appearance", file: "dashboard-estilo.png" },
];

const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 2 };
const MOBILE = { width: 430, height: 900, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

function log(msg) {
  console.log(`[capture] ${msg}`);
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Fuerza el idioma sin tocar la cuenta:
 * - cookie eyed-locale
 * - reescribe el campo "locale" de las respuestas JSON de la API (excepto auth)
 */
async function configureLocale(context) {
  const domain = new URL(BASE_URL).hostname;
  await context.addCookies([
    {
      name: "eyed-locale",
      value: LOCALE,
      domain,
      path: "/",
    },
  ]);

  await context.route("**/api/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/api/auth")) {
      await route.continue();
      return;
    }
    try {
      const response = await route.fetch();
      const contentType = response.headers()["content-type"] ?? "";
      if (!contentType.includes("application/json")) {
        await route.fulfill({ response });
        return;
      }
      const text = await response.text();
      let body = text;
      try {
        const json = JSON.parse(text);
        if (json && typeof json === "object" && typeof json.locale === "string") {
          json.locale = LOCALE;
          body = JSON.stringify(json);
        }
      } catch {
        /* respuesta no-JSON válida: dejar tal cual */
      }
      await route.fulfill({ response, body });
    } catch {
      await route.continue().catch(() => {});
    }
  });
}

async function login(page) {
  log(`Abriendo login en ${BASE_URL}/login`);
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });

  await page.fill("#email", LOGIN_EMAIL);
  await page.fill("#password", LOGIN_PASSWORD);
  await page.click('button[type="submit"]');

  // Dos posibles resultados: redirección directa a /dashboard, o paso de código.
  const codeInput = page.locator("#code");
  const result = await Promise.race([
    page
      .waitForURL("**/dashboard**", { timeout: 15000 })
      .then(() => "dashboard")
      .catch(() => null),
    codeInput
      .waitFor({ state: "visible", timeout: 15000 })
      .then(() => "code")
      .catch(() => null),
  ]);

  if (result === "code") {
    if (!LOGIN_CODE) {
      throw new Error(
        "La cuenta pide un código de verificación por email. Vuelve a ejecutar con $env:LOGIN_CODE=\"<código de 6 dígitos>\"."
      );
    }
    log("Introduciendo código de verificación");
    await codeInput.fill(LOGIN_CODE);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 15000 });
  } else if (result !== "dashboard") {
    // Puede que ya haya navegado; comprobamos.
    if (!page.url().includes("/dashboard")) {
      const err = await page
        .locator(".auth-error, [role='alert']")
        .first()
        .textContent()
        .catch(() => null);
      throw new Error(
        `No se pudo iniciar sesión${err ? `: ${err.trim()}` : ". Revisa email/contraseña."}`
      );
    }
  }

  log("Sesión iniciada");
}

async function captureDashboard(context) {
  const page = await context.newPage();
  await login(page);

  for (const { tab, file } of DASHBOARD_SHOTS) {
    log(`Capturando dashboard tab=${tab}`);
    await page.goto(`${BASE_URL}/dashboard?tab=${tab}`, { waitUntil: "networkidle" });
    await page.waitForSelector("main", { timeout: 15000 });
    await sleep(1800);
    const dest = path.join(OUT_DIR, withSuffix(file));
    await page.screenshot({ path: dest });
    log(`  → ${dest}`);
  }

  await page.close();
  return context.storageState();
}

async function captureProfile(browser, storageState) {
  if (!PROFILE_USERNAME) {
    log("PROFILE_USERNAME vacío: se omite la captura del perfil público.");
    return;
  }
  const context = await browser.newContext({
    viewport: { width: MOBILE.width, height: MOBILE.height },
    deviceScaleFactor: MOBILE.deviceScaleFactor,
    isMobile: MOBILE.isMobile,
    hasTouch: MOBILE.hasTouch,
    locale: CONTEXT_LOCALE,
    extraHTTPHeaders: { "Accept-Language": ACCEPT_LANGUAGE },
    storageState,
  });
  await configureLocale(context);
  const page = await context.newPage();
  const url = `${BASE_URL}/${PROFILE_USERNAME}`;
  log(`Capturando perfil público (con sesión, sin CTA) ${url}`);
  await page.goto(url, { waitUntil: "networkidle" });

  const gate = page.locator("button:has(span.animate-pulse)").first();
  if (await gate.count()) {
    log("  Pulsando pantalla de entrada");
    await gate.click({ force: true }).catch(() => {});
    await sleep(1500);
  }

  await sleep(2000);
  const dest = path.join(OUT_DIR, withSuffix("profile-kiddis.png"));
  // Recorte superior: perfil limpio sin barra de reclamar perfil al estar logueado.
  await page.screenshot({
    path: dest,
    clip: { x: 0, y: 0, width: MOBILE.width, height: 780 },
  });
  log(`  → ${dest}`);

  await context.close();
}

async function main() {
  if (!LOGIN_EMAIL || !LOGIN_PASSWORD) {
    throw new Error("Faltan LOGIN_EMAIL y/o LOGIN_PASSWORD en las variables de entorno.");
  }

  log(`Idioma objetivo: ${LOCALE}`);
  const browser = await chromium.launch({ headless: !HEADED });
  try {
    const context = await browser.newContext({
      viewport: { width: DESKTOP.width, height: DESKTOP.height },
      deviceScaleFactor: DESKTOP.deviceScaleFactor,
      locale: CONTEXT_LOCALE,
      extraHTTPHeaders: { "Accept-Language": ACCEPT_LANGUAGE },
    });
    await configureLocale(context);
    const storageState = await captureDashboard(context);
    await context.close();

    await captureProfile(browser, storageState);
  } finally {
    await browser.close();
  }

  log("Listo. Capturas guardadas en public/landing/.");
}

main().catch((err) => {
  console.error(`[capture] ERROR: ${err.message}`);
  process.exit(1);
});
