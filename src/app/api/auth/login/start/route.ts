import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/mail";
import { createVerificationCode, getCodeExpiry } from "@/lib/password-reset";
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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
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
