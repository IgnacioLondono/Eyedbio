import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/mail";
import { createVerificationCode, getCodeExpiry } from "@/lib/password-reset";
import { isUserBlocked } from "@/lib/auth-user";
import {
  ensureAdminUserForLogin,
  verifyLoginPassword,
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

    if (!user) {
      user = await ensureAdminUserForLogin(email, password);
      if (!user) {
        return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
      }
    } else {
      const valid = await verifyLoginPassword(user, email, password);
      if (!valid) {
        return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
      }
    }

    if (isUserBlocked(user)) {
      return NextResponse.json(
        { error: "Tu cuenta está bloqueada. Contacta con soporte si crees que es un error." },
        { status: 403 }
      );
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
    });

    return NextResponse.json({
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
