import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/types/profile";
import { normalizeEmail, normalizeUsername, validatePassword, validateUsername } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");
    const username = normalizeUsername(String(body.username ?? ""));
    const displayName = String(body.displayName ?? username).trim();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, contraseña y usuario son obligatorios" },
        { status: 400 }
      );
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.email === email
              ? "Este email ya está registrado"
              : "Este nombre de usuario ya está en uso",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        displayName: displayName || username,
        settings: JSON.stringify(DEFAULT_SETTINGS),
      },
    });

    return NextResponse.json(
      { id: user.id, username: user.username, email: user.email },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Error al crear la cuenta. Revisa que la base de datos esté activa." },
      { status: 500 }
    );
  }
}
