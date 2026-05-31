import { describeMailConfig, getMailConfig } from "@/lib/mail-config";

interface SendCodeOptions {
  to: string;
  code: string;
}

interface SendResult {
  sent: boolean;
  error?: string;
}

const SUBJECT = "Tu código de verificación — Eyed.bio";

function buildTextBody(code: string): string {
  return [
    "Tu código para restablecer la contraseña en Eyed.bio:",
    "",
    code,
    "",
    "Válido durante 15 minutos.",
    "Si no solicitaste este código, ignora este mensaje.",
  ].join("\n");
}

function buildHtmlBody(code: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#111">
      <h2 style="color:#7c3aed">Eyed.bio</h2>
      <p>Tu código de verificación para restablecer la contraseña:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#7c3aed;margin:24px 0">${code}</p>
      <p style="color:#666;font-size:13px">Válido 15 minutos. Si no fuiste tú, ignora este correo.</p>
    </div>
  `;
}

async function sendViaResend(
  to: string,
  code: string,
  apiKey: string,
  from: string
): Promise<SendResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: SUBJECT,
      text: buildTextBody(code),
      html: buildHtmlBody(code),
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
  smtp: NonNullable<ReturnType<typeof getMailConfig>["smtp"]>
): Promise<SendResult> {
  if (!smtp.user || !smtp.pass) {
    return {
      sent: false,
      error: "SMTP_USER y SMTP_PASS son obligatorios cuando usas SMTP_HOST",
    };
  }

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
    subject: SUBJECT,
    text: buildTextBody(code),
    html: buildHtmlBody(code),
  });

  return { sent: true };
}

export async function sendVerificationCodeEmail({
  to,
  code,
}: SendCodeOptions): Promise<SendResult> {
  const config = getMailConfig();

  if (config.provider === "none") {
    console.warn(
      `[Eyed.bio] Email no configurado (${describeMailConfig()}). ` +
        "Define RESEND_API_KEY o SMTP_HOST en Portainer."
    );
    console.info(`[Eyed.bio] Código de verificación para ${to}: ${code} (válido 15 min)`);
    return {
      sent: false,
      error: "Servidor de correo no configurado",
    };
  }

  try {
    const result =
      config.provider === "resend" && config.resend
        ? await sendViaResend(to, code, config.resend.apiKey, config.resend.from)
        : config.provider === "smtp" && config.smtp
          ? await sendViaSmtp(to, code, config.smtp)
          : { sent: false, error: "Proveedor de correo inválido" };

    if (result.sent) {
      console.info(`[Eyed.bio] Código enviado a ${to} vía ${describeMailConfig()}`);
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
