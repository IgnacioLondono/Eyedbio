import { parseLocale, type AppLocale } from "@/lib/i18n/types";
import { getSiteUrl } from "@/lib/config/site-url";

export type VerificationEmailPurpose = "reset" | "login";

const BRAND = {
  purple: "#7c3aed",
  violet: "#8b5cf6",
  fuchsia: "#a855f7",
  bgOuter: "#0c0c12",
  bgCard: "#14141c",
  bgCode: "#1e1b2e",
  border: "#2a2640",
  text: "#f4f4f5",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
};

interface EmailCopy {
  subject: string;
  preheader: string;
  badge: string;
  headline: string;
  intro: string;
  textIntro: string;
  codeLabel: string;
  expiryNotice: string;
  ignore: string;
  securityHint: string;
  ctaLabel: string;
  ctaPath: string;
  validMinutes: string;
  spamHint: string;
}

const COPY: Record<AppLocale, Record<VerificationEmailPurpose, EmailCopy>> = {
  es: {
    login: {
      subject: "Tu código de acceso — Eyed.bio",
      preheader: "Usa este código de 6 dígitos para iniciar sesión. Válido 15 minutos.",
      badge: "Verificación",
      headline: "Código de acceso",
      intro: "Introduce este código en Eyed.bio para completar tu inicio de sesión.",
      textIntro: "Tu código para iniciar sesión en Eyed.bio:",
      codeLabel: "Tu código",
      expiryNotice:
        'Válido durante <strong style="color:#f4f4f5;">15 minutos</strong>. Si no lo ves en la bandeja de entrada, revisa spam o promociones.',
      validMinutes: "Válido durante 15 minutos.",
      spamHint: "Revisa también la carpeta de spam si no lo ves en la bandeja de entrada.",
      ignore:
        "Si no intentaste iniciar sesión, ignora este mensaje y cambia tu contraseña lo antes posible.",
      securityHint:
        "Nunca compartas este código con nadie. Eyed.bio nunca te lo pedirá por teléfono o mensaje.",
      ctaLabel: "Ir a Eyed.bio",
      ctaPath: "/login",
    },
    reset: {
      subject: "Tu código de verificación — Eyed.bio",
      preheader: "Código para restablecer tu contraseña. Válido 15 minutos.",
      badge: "Verificación",
      headline: "Restablecer contraseña",
      intro: "Usa este código para crear una nueva contraseña en tu cuenta.",
      textIntro: "Tu código para restablecer la contraseña en Eyed.bio:",
      codeLabel: "Tu código",
      expiryNotice:
        'Válido durante <strong style="color:#f4f4f5;">15 minutos</strong>. Si no lo ves en la bandeja de entrada, revisa spam o promociones.',
      validMinutes: "Válido durante 15 minutos.",
      spamHint: "Revisa también la carpeta de spam si no lo ves en la bandeja de entrada.",
      ignore: "Si no solicitaste restablecer la contraseña, puedes ignorar este correo.",
      securityHint:
        "Nunca compartas este código con nadie. Eyed.bio nunca te lo pedirá por teléfono o mensaje.",
      ctaLabel: "Restablecer contraseña",
      ctaPath: "/forgot-password",
    },
  },
  en: {
    login: {
      subject: "Your access code — Eyed.bio",
      preheader: "Use this 6-digit code to sign in. Valid for 15 minutes.",
      badge: "Verification",
      headline: "Access code",
      intro: "Enter this code on Eyed.bio to complete your sign-in.",
      textIntro: "Your sign-in code for Eyed.bio:",
      codeLabel: "Your code",
      expiryNotice:
        'Valid for <strong style="color:#f4f4f5;">15 minutes</strong>. If you don\'t see it in your inbox, check spam or promotions.',
      validMinutes: "Valid for 15 minutes.",
      spamHint: "Also check your spam folder if you don't see it in your inbox.",
      ignore:
        "If you didn't try to sign in, ignore this message and change your password as soon as possible.",
      securityHint:
        "Never share this code with anyone. Eyed.bio will never ask for it by phone or message.",
      ctaLabel: "Go to Eyed.bio",
      ctaPath: "/login",
    },
    reset: {
      subject: "Your verification code — Eyed.bio",
      preheader: "Code to reset your password. Valid for 15 minutes.",
      badge: "Verification",
      headline: "Reset password",
      intro: "Use this code to set a new password on your account.",
      textIntro: "Your password reset code for Eyed.bio:",
      codeLabel: "Your code",
      expiryNotice:
        'Valid for <strong style="color:#f4f4f5;">15 minutes</strong>. If you don\'t see it in your inbox, check spam or promotions.',
      validMinutes: "Valid for 15 minutes.",
      spamHint: "Also check your spam folder if you don't see it in your inbox.",
      ignore: "If you didn't request a password reset, you can ignore this email.",
      securityHint:
        "Never share this code with anyone. Eyed.bio will never ask for it by phone or message.",
      ctaLabel: "Reset password",
      ctaPath: "/forgot-password",
    },
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCodeDisplay(code: string): string {
  return escapeHtml(code.replace(/\D/g, "").slice(0, 6));
}

export function getVerificationEmailCopy(
  purpose: VerificationEmailPurpose,
  locale?: AppLocale | string | null
): EmailCopy {
  const lang = parseLocale(locale);
  return COPY[lang][purpose];
}

export function buildVerificationEmailText(
  code: string,
  purpose: VerificationEmailPurpose,
  locale?: AppLocale | string | null
): string {
  const copy = getVerificationEmailCopy(purpose, locale);
  return [
    copy.textIntro,
    "",
    code,
    "",
    copy.validMinutes,
    copy.spamHint,
    "",
    copy.ignore,
    "",
    `${getSiteUrl()}${copy.ctaPath}`,
  ].join("\n");
}

export function buildVerificationEmailHtml(
  code: string,
  purpose: VerificationEmailPurpose,
  locale?: AppLocale | string | null
): string {
  const lang = parseLocale(locale);
  const copy = getVerificationEmailCopy(purpose, locale);
  const siteUrl = escapeHtml(getSiteUrl());
  const ctaUrl = escapeHtml(`${getSiteUrl()}${copy.ctaPath}`);
  const safePreheader = escapeHtml(copy.preheader);
  const safeBadge = escapeHtml(copy.badge);
  const safeHeadline = escapeHtml(copy.headline);
  const safeIntro = escapeHtml(copy.intro);
  const safeCodeLabel = escapeHtml(copy.codeLabel);
  const safeIgnore = escapeHtml(copy.ignore);
  const safeSecurityHint = escapeHtml(copy.securityHint);
  const safeCtaLabel = escapeHtml(copy.ctaLabel);
  const codeDisplay = formatCodeDisplay(code);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(copy.subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bgOuter};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    ${safePreheader}${"&nbsp;".repeat(48)}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.bgOuter};">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="${siteUrl}" style="text-decoration:none;display:inline-block;">
                <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:${BRAND.text};">
                  Eyed<span style="color:${BRAND.violet};">.</span>bio
                </span>
              </a>
            </td>
          </tr>

          <tr>
            <td style="background-color:${BRAND.bgCard};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td height="4" style="background:linear-gradient(90deg,${BRAND.purple},${BRAND.violet},${BRAND.fuchsia});font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:36px 32px 28px;">

                    <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.violet};">
                      ${safeBadge}
                    </p>
                    <h1 style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;line-height:1.25;color:${BRAND.text};">
                      ${safeHeadline}
                    </h1>
                    <p style="margin:0 0 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${BRAND.textMuted};">
                      ${safeIntro}
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="background-color:${BRAND.bgCode};border:1px solid ${BRAND.border};border-radius:12px;padding:24px 20px;">
                          <p style="margin:0 0 6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.textDim};">
                            ${safeCodeLabel}
                          </p>
                          <p style="margin:0;font-family:'SF Mono',SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;font-size:36px;font-weight:700;letter-spacing:0.18em;color:${BRAND.text};">
                            ${codeDisplay}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px;">
                      <tr>
                        <td style="padding:14px 16px;background-color:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:10px;">
                          <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:${BRAND.textMuted};">
                            ⏱&nbsp; ${copy.expiryNotice}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:28px;">
                      <tr>
                        <td align="center">
                          <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,${BRAND.purple},${BRAND.violet});color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;mso-padding-alt:0;">
                            <!--[if mso]><i style="letter-spacing:32px;mso-font-width:-100%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
                            <span style="mso-text-raise:15pt;">${safeCtaLabel}</span>
                            <!--[if mso]><i style="letter-spacing:32px;mso-font-width:-100%">&nbsp;</i><![endif]-->
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 8px 0;">
              <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${BRAND.textDim};text-align:center;">
                🔒&nbsp; ${safeIgnore}
              </p>
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:${BRAND.textDim};text-align:center;">
                ${safeSecurityHint}
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 8px 0;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;color:${BRAND.textDim};">
                © ${year} Eyed.bio · <a href="${siteUrl}" style="color:${BRAND.violet};text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
