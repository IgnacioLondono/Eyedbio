import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/prisma";
import {
  getAdminSupportTicket,
  validateSupportMessage,
  validateSupportStatus,
} from "@/lib/support";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;

  try {
    const ticket = await getAdminSupportTicket(id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "Error al cargar el ticket" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Props) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;

  try {
    const body = await request.json();
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }

    const status = body.status ? String(body.status) : undefined;
    const reply = body.reply ? String(body.reply).trim() : "";

    if (status && !validateSupportStatus(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    if (reply) {
      const messageError = validateSupportMessage(reply);
      if (messageError) {
        return NextResponse.json({ error: messageError }, { status: 400 });
      }
    }

    if (!status && !reply) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      if (reply) {
        await tx.supportMessage.create({
          data: {
            ticketId: id,
            authorId: guard.admin.id,
            isStaff: true,
            body: reply,
          },
        });
      }

      const nextStatus =
        status ??
        (reply && ticket.status === "open" ? "in_progress" : ticket.status);

      await tx.supportTicket.update({
        where: { id },
        data: {
          status: nextStatus,
          updatedAt: new Date(),
        },
      });
    });

    const updated = await getAdminSupportTicket(id);
    return NextResponse.json({ ticket: updated });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el ticket" }, { status: 500 });
  }
}
