import { NextResponse } from "next/server";
import { safeRevalidateTag } from "@/lib/cache-utils";
import { profileCacheTag } from "@/lib/cached-profile";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureUserPublicUid } from "@/lib/public-uid";
import { getSiteSettings } from "@/lib/site-settings";
import { hashAccessCode } from "@/lib/profile-access";
import {
  getUsernameChangeStatus,
  normalizeAccessCode,
  normalizeEmail,
  normalizeUsername,
  validateAccessCode,
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
      publicUid: true,
      createdAt: true,
      usernameChangedAt: true,
      accessCodeEnabled: true,
      accessCodeHash: true,
      loginCodeEnabled: true,
      locale: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const site = await getSiteSettings();
  const publicUid = user.publicUid ?? (await ensureUserPublicUid(session.user.id));

  const { canChange, nextChangeAt } = getUsernameChangeStatus(user.usernameChangedAt);

  return NextResponse.json({
    email: user.email,
    username: user.username,
    publicUid: site.showPublicUidInAccount ? publicUid : undefined,
    createdAt: user.createdAt.toISOString(),
    usernameChangedAt: user.usernameChangedAt?.toISOString() ?? null,
    canChangeUsername: canChange,
    nextUsernameChangeAt: nextChangeAt?.toISOString() ?? null,
    accessCodeEnabled: user.accessCodeEnabled,
    hasAccessCode: Boolean(user.accessCodeHash),
    loginCodeEnabled: user.loginCodeEnabled,
    locale: user.locale === "en" ? "en" : "es",
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
    const accessCodeEnabled =
      body.accessCodeEnabled !== undefined ? Boolean(body.accessCodeEnabled) : undefined;
    const accessCode =
      body.accessCode !== undefined ? normalizeAccessCode(String(body.accessCode)) : undefined;
    const loginCodeEnabled =
      body.loginCodeEnabled !== undefined ? Boolean(body.loginCodeEnabled) : undefined;
    const locale =
      body.locale !== undefined ? (body.locale === "en" ? "en" : "es") : undefined;

    const sensitiveFields =
      email !== undefined ||
      username !== undefined ||
      newPassword ||
      accessCodeEnabled !== undefined ||
      accessCode !== undefined ||
      loginCodeEnabled !== undefined;

    if (sensitiveFields && !currentPassword) {
      return NextResponse.json(
        { error: "Introduce tu contraseña actual para confirmar los cambios" },
        { status: 400 }
      );
    }

    if (locale !== undefined && !sensitiveFields) {
      const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: { locale },
        select: { locale: true },
      });
      return NextResponse.json({
        message: "Idioma actualizado",
        locale: updated.locale === "en" ? "en" : "es",
      });
    }

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

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Esta cuenta usa inicio de sesión social y no tiene contraseña local" },
        { status: 400 }
      );
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
      accessCodeEnabled?: boolean;
      accessCodeHash?: string | null;
      loginCodeEnabled?: boolean;
      locale?: string;
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

    if (accessCodeEnabled !== undefined || accessCode !== undefined) {
      const siteForAccess = await getSiteSettings();
      if (
        !siteForAccess.profileAccessCodeEnabled &&
        (accessCodeEnabled === true || accessCode)
      ) {
        return NextResponse.json(
          { error: "La protección por código de acceso no está disponible" },
          { status: 403 }
        );
      }
      if (accessCodeEnabled === false) {
        updates.accessCodeEnabled = false;
        updates.accessCodeHash = null;
      } else if (accessCodeEnabled === true) {
        updates.accessCodeEnabled = true;
        if (accessCode) {
          const accessCodeError = validateAccessCode(accessCode);
          if (accessCodeError) {
            return NextResponse.json({ error: accessCodeError }, { status: 400 });
          }
          updates.accessCodeHash = await hashAccessCode(accessCode);
        } else if (!user.accessCodeHash) {
          return NextResponse.json(
            { error: "Introduce un código de acceso para activar la protección" },
            { status: 400 }
          );
        }
      } else if (accessCode) {
        const accessCodeError = validateAccessCode(accessCode);
        if (accessCodeError) {
          return NextResponse.json({ error: accessCodeError }, { status: 400 });
        }
        updates.accessCodeHash = await hashAccessCode(accessCode);
        updates.accessCodeEnabled = true;
      }
    }

    if (loginCodeEnabled !== undefined) {
      const site = await getSiteSettings();
      if (!site.allowLoginCodeByEmail && loginCodeEnabled) {
        return NextResponse.json(
          { error: "El código por correo al iniciar sesión no está disponible" },
          { status: 403 }
        );
      }
      updates.loginCodeEnabled = loginCodeEnabled;
      if (loginCodeEnabled === false) {
        await prisma.loginVerificationToken.deleteMany({ where: { userId: user.id } });
      }
    }

    if (locale !== undefined) {
      updates.locale = locale;
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
        accessCodeEnabled: true,
        accessCodeHash: true,
        loginCodeEnabled: true,
        locale: true,
      },
      data: updates,
    });

    const usernameStatus = getUsernameChangeStatus(updated.usernameChangedAt);

    const profileFieldsChanged =
      updates.username !== undefined ||
      updates.accessCodeEnabled !== undefined ||
      updates.accessCodeHash !== undefined;

    if (profileFieldsChanged) {
      safeRevalidateTag(profileCacheTag(user.username));
      if (updates.username !== undefined) {
        safeRevalidateTag(profileCacheTag(updates.username));
      }
    }

    return NextResponse.json({
      email: updated.email,
      username: updated.username,
      createdAt: updated.createdAt.toISOString(),
      usernameChangedAt: updated.usernameChangedAt?.toISOString() ?? null,
      canChangeUsername: usernameStatus.canChange,
      nextUsernameChangeAt: usernameStatus.nextChangeAt?.toISOString() ?? null,
      accessCodeEnabled: updated.accessCodeEnabled,
      hasAccessCode: Boolean(updated.accessCodeHash),
      loginCodeEnabled: updated.loginCodeEnabled,
      locale: updated.locale === "en" ? "en" : "es",
      message: "Cuenta actualizada correctamente",
    });
  } catch {
    return NextResponse.json({ error: "Error al actualizar la cuenta" }, { status: 500 });
  }
}
