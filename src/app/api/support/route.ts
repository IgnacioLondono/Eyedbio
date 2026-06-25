import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserBlocked } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { OPEN_SUPPORT_STATUSES, MAX_OPEN_TICKETS_PER_USER } from "@/lib/support-config";
import {
  listUserSupportTickets,
  validateSupportCreateInput,
} from "@/lib/support";

async function rejectIfBlocked(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { blockedAt: true },
  });
  if (!user || isUserBlocked(user)) {
    return NextResponse.json(
      { error: "Tu cuenta está bloqueada. Contacta con soporte." },
      { status: 403 }
    );
  }
  return null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const site = await getSiteSettings();
  if (!site.supportEnabled) {
    return NextResponse.json({ error: "Soporte no disponible" }, { status: 403 });
  }

  const blocked = await rejectIfBlocked(session.user.id);
  if (blocked) return blocked;

  try {
    const tickets = await listUserSupportTickets(session.user.id);
    return NextResponse.json({ tickets });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar los tickets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const site = await getSiteSettings();
  if (!site.supportEnabled) {
    return NextResponse.json({ error: "Soporte no disponible" }, { status: 403 });
  }

  const blocked = await rejectIfBlocked(session.user.id);
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const validation = validateSupportCreateInput({
      category: String(body.category ?? ""),
      subject: String(body.subject ?? ""),
      message: String(body.message ?? ""),
    });
    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 });
    }

    const openCount = await prisma.supportTicket.count({
      where: {
        userId: session.user.id,
        status: { in: OPEN_SUPPORT_STATUSES },
      },
    });

    if (openCount >= MAX_OPEN_TICKETS_PER_USER) {
      return NextResponse.json(
        {
          error: `Tienes demasiados tickets abiertos (máx. ${MAX_OPEN_TICKETS_PER_USER}). Cierra uno antes de abrir otro.`,
        },
        { status: 400 }
      );
    }

    const subject = String(body.subject).trim();
    const message = String(body.message).trim();
    const category = String(body.category).trim();

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        category,
        subject,
        status: "open",
        messages: {
          create: {
            authorId: session.user.id,
            isStaff: false,
            body: message,
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: { body: true, createdAt: true },
        },
      },
    });

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        category: ticket.category,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo crear el ticket" }, { status: 500 });
  }
}
