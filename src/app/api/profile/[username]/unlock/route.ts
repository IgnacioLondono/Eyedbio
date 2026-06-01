import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  normalizeAccessCode,
  validateAccessCode,
} from "@/lib/validation";
import {
  profileUnlockCookieName,
  signProfileUnlockToken,
  verifyAccessCode,
} from "@/lib/profile-access";

interface Props {
  params: Promise<{ username: string }>;
}

export async function POST(request: Request, { params }: Props) {
  const { username } = await params;
  const normalizedUsername = username.toLowerCase();

  try {
    const body = await request.json();
    const code = normalizeAccessCode(String(body.code ?? ""));
    const codeError = validateAccessCode(code);
    if (codeError) {
      return NextResponse.json({ error: codeError }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: {
        id: true,
        username: true,
        accessCodeEnabled: true,
        accessCodeHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    if (!user.accessCodeEnabled || !user.accessCodeHash) {
      return NextResponse.json({ unlocked: true });
    }

    const valid = await verifyAccessCode(code, user.accessCodeHash);
    if (!valid) {
      return NextResponse.json({ error: "Código de acceso incorrecto" }, { status: 403 });
    }

    const token = signProfileUnlockToken(user.id, normalizedUsername);
    const response = NextResponse.json({ unlocked: true, token });
    response.cookies.set(profileUnlockCookieName(normalizedUsername), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "No se pudo verificar el código" }, { status: 500 });
  }
}
