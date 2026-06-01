import { describeMailConfig, getMailConfig } from "@/lib/mail-config";

export type VerificationEmailPurpose = "reset" | "login";

interface SendCodeOptions {
  to: string;
  code: string;
  purpose?: VerificationEmailPurpose;
}

interface SendResult {
  sent: boolean;
  error?: string;
}

function getCopy(purpose: VerificationEmailPurpose) {
  if (purpose === "login") {
    return {
      subject: "Tu código de acceso — Eyed.bio",
      intro: "Tu código para iniciar sesión en Eyed.bio:",
      htmlIntro: "Tu código de acceso para iniciar sesión:",
      ignore:
        "Si no intentaste iniciar sesión, ignora este mensaje y cambia tu contraseña.",
    };
  }

  return {
    subject: "Tu código de verificación — Eyed.bio",
    intro: "Tu código para restablecer la contraseña en Eyed.bio:",
    htmlIntro: "Tu código de verificación para restablecer la contraseña:",
    ignore: "Si no solicitaste este código, ignora este mensaje.",
  };
}

function buildTextBody(code: string, purpose: VerificationEmailPurpose): string {
  const copy = getCopy(purpose);
  return [
    copy.intro,
    "",
    code,
    "",
    "Válido durante 15 minutos.",
    "Revisa también la carpeta de spam si no lo ves en la bandeja de entrada.",
    copy.ignore,
  ].join("\n");
}

function buildHtmlBody(code: string, purpose: VerificationEmailPurpose): string {
  const copy = getCopy(purpose);
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#111">
      <h2 style="color:#7c3aed">Eyed.bio</h2>
      <p>${copy.htmlIntro}</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#7c3aed;margin:24px 0">${code}</p>
      <p style="color:#666;font-size:13px">Válido 15 minutos. Si no ves el correo, revisa spam.</p>
      <p style="color:#666;font-size:13px">${copy.ignore}</p>
    </div>
  `;
}

async function sendViaResend(
  to: string,
  code: string,
  purpose: VerificationEmailPurpose,
  apiKey: string,
  from: string
): Promise<SendResult> {
  const copy = getCopy(purpose);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: copy.subject,
      text: buildTextBody(code, purpose),
      html: buildHtmlBody(code, purpose),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      sent: false,
      error: `Resend ${response.status}: ${body.slice(0, 300)}`,
    };
  }

  return { sent: true };
}

async function sendViaSmtp(
  to: string,
  code: string,
  purpose: VerificationEmailPurpose,
  smtp: NonNullable<ReturnType<typeof getMailConfig>["smtp"]>
): Promise<SendResult> {
  if (!smtp.user || !smtp.pass) {
    return {
      sent: false,
      error: "SMTP_USER y SMTP_PASS son obligatorios cuando usas SMTP_HOST",
    };
  }

  const copy = getCopy(purpose);
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
    tls: {
      minVersion: "TLSv1.2",
    },
  });

  await transporter.verify();

  await transporter.sendMail({
    from: smtp.from,
    to,
    subject: copy.subject,
    text: buildTextBody(code, purpose),
    html: buildHtmlBody(code, purpose),
  });

  return { sent: true };
}

export async function sendVerificationCodeEmail({
  to,
  code,
  purpose = "reset",
}: SendCodeOptions): Promise<SendResult> {
  const config = getMailConfig();
  const label = purpose === "login" ? "acceso" : "verificación";

  if (config.provider === "none") {
    console.warn(
      `[Eyed.bio] Email no configurado (${describeMailConfig()}). ` +
        "Define RESEND_API_KEY o SMTP_HOST en Portainer."
    );
    console.info(`[Eyed.bio] Código de ${label} para ${to}: ${code} (válido 15 min)`);
    return {
      sent: false,
      error: "Servidor de correo no configurado",
    };
  }

  try {
    const result =
      config.provider === "resend" && config.resend
        ? await sendViaResend(to, code, purpose, config.resend.apiKey, config.resend.from)
        : config.provider === "smtp" && config.smtp
          ? await sendViaSmtp(to, code, purpose, config.smtp)
          : { sent: false, error: "Proveedor de correo inválido" };

    if (result.sent) {
      console.info(`[Eyed.bio] Código de ${label} enviado a ${to} vía ${describeMailConfig()}`);
      return result;
    }

    console.error(`[Eyed.bio] Error enviando código a ${to}:`, result.error);
    console.info(`[Eyed.bio] Código (fallback) para ${to}: ${code}`);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Eyed.bio] Error enviando código a ${to}:`, message);
    console.info(`[Eyed.bio] Código (fallback) para ${to}: ${code}`);
    return { sent: false, error: message };
  }
}
