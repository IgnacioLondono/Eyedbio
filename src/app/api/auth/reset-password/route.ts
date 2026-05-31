import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  isValidVerificationCode,
  normalizeVerificationCode,
} from "@/lib/password-reset";
import { normalizeEmail, validateEmail, validatePassword } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const code = normalizeVerificationCode(String(body.code ?? ""));
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    if (!isValidVerificationCode(code)) {
      return NextResponse.json({ error: "Introduce un código de 6 dígitos válido" }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Las contraseñas no coinciden" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Código incorrecto o expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, token: code },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Código incorrecto o expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ message: "Contraseña actualizada. Ya puedes iniciar sesión." });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Error al restablecer la contraseña" }, { status: 500 });
  }
}
