interface SendCodeOptions {
  to: string;
  code: string;
}

export async function sendVerificationCodeEmail({ to, code }: SendCodeOptions) {
  const smtpHost = process.env.SMTP_HOST;

  if (!smtpHost) {
    console.info(`[Eyed.bio] Código de verificación para ${to}: ${code} (válido 15 min)`);
    return { sent: false };
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
      subject: "Tu código de verificación — Eyed.bio",
      text: [
        "Tu código para restablecer la contraseña en Eyed.bio:",
        "",
        code,
        "",
        "Válido durante 15 minutos.",
        "Si no solicitaste este código, ignora este mensaje.",
      ].join("\n"),
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#111">
          <h2 style="color:#7c3aed">Eyed.bio</h2>
          <p>Tu código de verificación para restablecer la contraseña:</p>
          <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#7c3aed;margin:24px 0">${code}</p>
          <p style="color:#666;font-size:13px">Válido 15 minutos. Si no fuiste tú, ignora este correo.</p>
        </div>
      `,
    });

    return { sent: true };
  } catch (err) {
    console.error("[mail] Error enviando código:", err);
    console.info(`[Eyed.bio] Código de verificación (fallback) para ${to}: ${code}`);
    return { sent: false };
  }
}
