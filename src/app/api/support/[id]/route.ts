import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserBlocked } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import {
  getUserSupportTicket,
  validateSupportMessage,
} from "@/lib/support";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const site = await getSiteSettings();
  if (!site.supportEnabled) {
    return NextResponse.json({ error: "Soporte no disponible" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { blockedAt: true },
  });
  if (!user || isUserBlocked(user)) {
    return NextResponse.json({ error: "Cuenta bloqueada" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const ticket = await getUserSupportTicket(session.user.id, id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "Error al cargar el ticket" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const site = await getSiteSettings();
  if (!site.supportEnabled) {
    return NextResponse.json({ error: "Soporte no disponible" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { blockedAt: true },
  });
  if (!user || isUserBlocked(user)) {
    return NextResponse.json({ error: "Cuenta bloqueada" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const messageError = validateSupportMessage(String(body.message ?? ""));
    if (messageError) {
      return NextResponse.json({ error: messageError }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, status: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }

    if (ticket.status === "closed") {
      return NextResponse.json({ error: "Este ticket está cerrado" }, { status: 400 });
    }

    const text = String(body.message).trim();

    await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          authorId: session.user.id,
          isStaff: false,
          body: text,
        },
      }),
      prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: ticket.status === "resolved" ? "open" : ticket.status,
          updatedAt: new Date(),
        },
      }),
    ]);

    const updated = await getUserSupportTicket(session.user.id, id);
    return NextResponse.json({ ticket: updated });
  } catch {
    return NextResponse.json({ error: "No se pudo enviar el mensaje" }, { status: 500 });
  }
}
