import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/mail";
import { createVerificationCode, getCodeExpiry } from "@/lib/password-reset";
import { isUserBlocked } from "@/lib/auth-user";
import {
  getAdminEnvPassword,
  isAdminConfigured,
  isAdminEnvEmail,
  syncAdminFromEnvIfEmail,
} from "@/lib/admin-credentials";
import { normalizeEmail } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (isAdminEnvEmail(email)) {
      if (!isAdminConfigured()) {
        console.error(
          "[login/start] ADMIN_EMAIL coincide pero ADMIN_PASSWORD no está en el contenedor de la app"
        );
        return NextResponse.json(
          {
            error:
              "Falta ADMIN_PASSWORD en el contenedor eyed-bio (no solo en nginx). Revisa las variables y redespliega.",
          },
          { status: 503 }
        );
      }

      const synced = await syncAdminFromEnvIfEmail(email);
      if (synced) user = synced;
    }

    if (!user) {
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      console.warn("[login/start] Contraseña incorrecta", {
        email,
        isAdminEmail: isAdminEnvEmail(email),
        adminEnvReady: isAdminConfigured(),
        hasAdminPasswordInEnv: Boolean(getAdminEnvPassword()),
      });
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    }

    if (isUserBlocked(user)) {
      return NextResponse.json(
        { error: "Tu cuenta está bloqueada. Contacta con soporte si crees que es un error." },
        { status: 403 }
      );
    }

    if (!user.loginCodeEnabled) {
      return NextResponse.json({
        requiresCode: false,
      });
    }

    await prisma.loginVerificationToken.deleteMany({ where: { userId: user.id } });

    const code = createVerificationCode();
    await prisma.loginVerificationToken.create({
      data: {
        userId: user.id,
        token: code,
        expiresAt: getCodeExpiry(15),
      },
    });

    const mail = await sendVerificationCodeEmail({
      to: user.email,
      code,
      purpose: "login",
      locale: user.locale,
    });

    return NextResponse.json({
      requiresCode: true,
      message: mail.sent
        ? "Te enviamos un código de acceso de 6 dígitos. Revisa tu bandeja de entrada y la carpeta de spam."
        : "Código generado. Revisa tu correo; si no llega, contacta con soporte.",
      emailSent: mail.sent,
    });
  } catch (err) {
    console.error("[login/start]", err);
    return NextResponse.json({ error: "No se pudo iniciar el acceso" }, { status: 500 });
  }
}
