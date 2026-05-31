import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/types/profile";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");
    const username = String(body.username ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "");
    const displayName = String(body.displayName ?? username).trim();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, contraseña y usuario son obligatorios" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "El usuario debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
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
