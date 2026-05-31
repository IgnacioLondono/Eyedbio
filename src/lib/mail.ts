import { buildResetPasswordUrl } from "@/lib/password-reset";

interface SendResetEmailOptions {
  to: string;
  token: string;
}

export async function sendPasswordResetEmail({ to, token }: SendResetEmailOptions) {
  const resetUrl = buildResetPasswordUrl(token);
  const smtpHost = process.env.SMTP_HOST;

  if (!smtpHost) {
    console.info(`[Eyed.bio] Enlace de recuperación para ${to}: ${resetUrl}`);
    return { sent: false, resetUrl };
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? "Eyed.bio <noreply@eyed.bio>",
      to,
      subject: "Restablece tu contraseña — Eyed.bio",
      text: [
        "Recibimos una solicitud para restablecer tu contraseña en Eyed.bio.",
        "",
        `Abre este enlace (válido 1 hora): ${resetUrl}`,
        "",
        "Si no solicitaste este cambio, ignora este mensaje.",
      ].join("\n"),
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#111">
          <h2 style="color:#7c3aed">Eyed.bio</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">Restablecer contraseña</a></p>
          <p style="color:#666;font-size:13px">El enlace expira en 1 hora. Si no fuiste tú, ignora este correo.</p>
        </div>
      `,
    });

    return { sent: true, resetUrl };
  } catch (err) {
    console.error("[mail] Error enviando correo de recuperación:", err);
    console.info(`[Eyed.bio] Enlace de recuperación (fallback) para ${to}: ${resetUrl}`);
    return { sent: false, resetUrl };
  }
}
