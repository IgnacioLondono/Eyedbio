export type MailProvider = "resend" | "smtp" | "none";

export interface MailConfig {
  provider: MailProvider;
  resend?: {
    apiKey: string;
    from: string;
  };
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
}

export function getMailConfig(): MailConfig {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    return {
      provider: "resend",
      resend: {
        apiKey: resendKey,
        from:
          process.env.RESEND_FROM?.trim() ??
          process.env.SMTP_FROM?.trim() ??
          "Eyed.bio <onboarding@resend.dev>",
      },
    };
  }

  const host = process.env.SMTP_HOST?.trim();
  if (host) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER?.trim() ?? "";
    const pass = process.env.SMTP_PASS ?? "";
    const secure =
      process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1" || port === 465;

    const fromDefault = user.includes("@") ? `Eyed.bio <${user}>` : "Eyed.bio <noreply@eyed.bio>";

    return {
      provider: "smtp",
      smtp: {
        host,
        port,
        secure,
        user,
        pass,
        from: process.env.SMTP_FROM?.trim() ?? fromDefault,
      },
    };
  }

  return { provider: "none" };
}

export function isMailConfigured(): boolean {
  return getMailConfig().provider !== "none";
}

export function describeMailConfig(): string {
  const config = getMailConfig();
  if (config.provider === "resend") {
    return `Resend (${config.resend?.from})`;
  }
  if (config.provider === "smtp") {
    return `SMTP ${config.smtp?.host}:${config.smtp?.port} (${config.smtp?.from})`;
  }
  return "sin configurar (solo logs)";
}
