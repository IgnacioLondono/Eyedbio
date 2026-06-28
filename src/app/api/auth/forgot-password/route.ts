import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/email/mail";
import { createVerificationCode, getCodeExpiry } from "@/lib/auth/password-reset";
import { normalizeEmail, validateEmail } from "@/lib/validation";

const GENERIC_MESSAGE =
  "Si el email está registrado, recibirás un código de verificación de 6 dígitos. Revisa también la carpeta de spam.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

      const code = createVerificationCode();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: code,
          expiresAt: getCodeExpiry(15),
        },
      });

      await sendVerificationCodeEmail({ to: user.email, code, locale: user.locale });
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "No se pudo procesar la solicitud" }, { status: 500 });
  }
}
