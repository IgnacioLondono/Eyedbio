import type { AppLocale } from "@/lib/i18n/types";
import { describeMailConfig, getMailConfig } from "@/lib/config/mail-config";
import {
  buildVerificationEmailHtml,
  buildVerificationEmailText,
  getVerificationEmailCopy,
  type VerificationEmailPurpose,
} from "@/lib/email/verification-email-template";

export type { VerificationEmailPurpose };

interface SendCodeOptions {
  to: string;
  code: string;
  purpose?: VerificationEmailPurpose;
  locale?: AppLocale | string | null;
}

interface SendResult {
  sent: boolean;
  error?: string;
}

async function sendViaResend(
  to: string,
  code: string,
  purpose: VerificationEmailPurpose,
  apiKey: string,
  from: string,
  locale?: AppLocale | string | null
): Promise<SendResult> {
  const copy = getVerificationEmailCopy(purpose, locale);
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
      text: buildVerificationEmailText(code, purpose, locale),
      html: buildVerificationEmailHtml(code, purpose, locale),
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
  smtp: NonNullable<ReturnType<typeof getMailConfig>["smtp"]>,
  locale?: AppLocale | string | null
): Promise<SendResult> {
  if (!smtp.user || !smtp.pass) {
    return {
      sent: false,
      error: "SMTP_USER y SMTP_PASS son obligatorios cuando usas SMTP_HOST",
    };
  }

  const copy = getVerificationEmailCopy(purpose, locale);
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
    text: buildVerificationEmailText(code, purpose, locale),
    html: buildVerificationEmailHtml(code, purpose, locale),
  });

  return { sent: true };
}

export async function sendVerificationCodeEmail({
  to,
  code,
  purpose = "reset",
  locale,
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
        ? await sendViaResend(to, code, purpose, config.resend.apiKey, config.resend.from, locale)
        : config.provider === "smtp" && config.smtp
          ? await sendViaSmtp(to, code, purpose, config.smtp, locale)
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
