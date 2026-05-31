import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import { createResetTokenValue, getResetExpiry } from "@/lib/password-reset";
import { normalizeEmail, validateEmail } from "@/lib/validation";

const GENERIC_MESSAGE =
  "Si el email está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos.";

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

      const token = createResetTokenValue();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: getResetExpiry(1),
        },
      });

      await sendPasswordResetEmail({ to: user.email, token });
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "No se pudo procesar la solicitud" }, { status: 500 });
  }
}
