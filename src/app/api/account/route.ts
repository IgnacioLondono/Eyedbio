import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getUsernameChangeStatus,
  normalizeEmail,
  normalizeUsername,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      username: true,
      createdAt: true,
      usernameChangedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const { canChange, nextChangeAt } = getUsernameChangeStatus(user.usernameChangedAt);

  return NextResponse.json({
    email: user.email,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
    usernameChangedAt: user.usernameChangedAt?.toISOString() ?? null,
    canChangeUsername: canChange,
    nextUsernameChangeAt: nextChangeAt?.toISOString() ?? null,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentPassword = String(body.currentPassword ?? "");
    const email = body.email !== undefined ? normalizeEmail(String(body.email)) : undefined;
    const username =
      body.username !== undefined ? normalizeUsername(String(body.username)) : undefined;
    const newPassword = body.newPassword ? String(body.newPassword) : undefined;
    const confirmPassword = body.confirmPassword ? String(body.confirmPassword) : undefined;

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Introduce tu contraseña actual para confirmar los cambios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 403 });
    }

    const updates: {
      email?: string;
      username?: string;
      passwordHash?: string;
      usernameChangedAt?: Date;
    } = {};

    if (email !== undefined && email !== user.email) {
      const emailError = validateEmail(email);
      if (emailError) return NextResponse.json({ error: emailError }, { status: 400 });

      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) {
        return NextResponse.json({ error: "Este email ya está en uso" }, { status: 409 });
      }
      updates.email = email;
    }

    if (username !== undefined && username !== user.username) {
      const { canChange, nextChangeAt } = getUsernameChangeStatus(user.usernameChangedAt);
      if (!canChange && nextChangeAt) {
        const dateLabel = nextChangeAt.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        return NextResponse.json(
          {
            error: `Solo puedes cambiar tu usuario cada 14 días. Podrás cambiarlo de nuevo el ${dateLabel}.`,
            nextUsernameChangeAt: nextChangeAt.toISOString(),
          },
          { status: 429 }
        );
      }

      const usernameError = validateUsername(username);
      if (usernameError) return NextResponse.json({ error: usernameError }, { status: 400 });

      const taken = await prisma.user.findUnique({ where: { username } });
      if (taken) {
        return NextResponse.json({ error: "Este nombre de usuario ya está en uso" }, { status: 409 });
      }
      updates.username = username;
      updates.usernameChangedAt = new Date();
    }

    if (newPassword) {
      const passwordError = validatePassword(newPassword);
      if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "Las contraseñas nuevas no coinciden" }, { status: 400 });
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No hay cambios para guardar" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      select: {
        email: true,
        username: true,
        createdAt: true,
        usernameChangedAt: true,
      },
      data: updates,
    });

    const usernameStatus = getUsernameChangeStatus(updated.usernameChangedAt);

    return NextResponse.json({
      email: updated.email,
      username: updated.username,
      createdAt: updated.createdAt.toISOString(),
      usernameChangedAt: updated.usernameChangedAt?.toISOString() ?? null,
      canChangeUsername: usernameStatus.canChange,
      nextUsernameChangeAt: usernameStatus.nextChangeAt?.toISOString() ?? null,
      message: "Cuenta actualizada correctamente",
    });
  } catch {
    return NextResponse.json({ error: "Error al actualizar la cuenta" }, { status: 500 });
  }
}
