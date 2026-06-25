import { prisma } from "@/lib/prisma";
import {
  isSupportCategory,
  isSupportStatus,
  OPEN_SUPPORT_STATUSES,
  type SupportCategory,
  type SupportStatus,
} from "@/lib/support-config";
import type {
  AdminSupportTicketRow,
  SupportMessageRow,
  SupportTicketDetail,
  SupportTicketSummary,
} from "@/types/support";

function previewBody(body: string, max = 80): string {
  const trimmed = body.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function mapMessage(message: {
  id: string;
  authorId: string | null;
  isStaff: boolean;
  body: string;
  createdAt: Date;
}): SupportMessageRow {
  return {
    id: message.id,
    authorId: message.authorId,
    isStaff: message.isStaff,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  };
}

export function mapTicketSummary(ticket: {
  id: string;
  category: string;
  subject: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  messages: { body: string; createdAt: Date }[];
}): SupportTicketSummary {
  const last = ticket.messages[ticket.messages.length - 1];
  return {
    id: ticket.id,
    category: ticket.category as SupportCategory,
    subject: ticket.subject,
    status: ticket.status as SupportStatus,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    messageCount: ticket.messages.length,
    lastMessagePreview: last ? previewBody(last.body) : "",
  };
}

export async function listUserSupportTickets(userId: string): Promise<SupportTicketSummary[]> {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { body: true, createdAt: true },
      },
    },
  });

  return tickets.map(mapTicketSummary);
}

export async function getUserSupportTicket(
  userId: string,
  ticketId: string
): Promise<SupportTicketDetail | null> {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) return null;

  return {
    ...mapTicketSummary(ticket),
    messages: ticket.messages.map(mapMessage),
  };
}

export async function listAdminSupportTickets(options: {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ tickets: AdminSupportTicketRow[]; total: number; totalPages: number }> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: {
    status?: string | { in: string[] };
    OR?: Array<
      | { subject: { contains: string; mode: "insensitive" } }
      | { user: { email: { contains: string; mode: "insensitive" } } }
      | { user: { username: { contains: string; mode: "insensitive" } } }
      | { user: { displayName: { contains: string; mode: "insensitive" } } }
    >;
  } = {};

  if (options.status && options.status !== "all") {
    if (options.status === "active") {
      where.status = { in: OPEN_SUPPORT_STATUSES };
    } else if (isSupportStatus(options.status)) {
      where.status = options.status;
    }
  }

  const q = options.q?.trim();
  if (q) {
    where.OR = [
      { subject: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { user: { username: { contains: q, mode: "insensitive" } } },
      { user: { displayName: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [total, tickets] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, email: true, username: true, displayName: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: { body: true, createdAt: true },
        },
      },
    }),
  ]);

  return {
    tickets: tickets.map((ticket) => ({
      ...mapTicketSummary(ticket),
      user: ticket.user,
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getAdminSupportTicket(ticketId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: { id: true, email: true, username: true, displayName: true },
      },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) return null;

  return {
    ...mapTicketSummary(ticket),
    user: ticket.user,
    messages: ticket.messages.map(mapMessage),
  };
}

export async function countOpenSupportTickets(): Promise<number> {
  return prisma.supportTicket.count({
    where: { status: { in: OPEN_SUPPORT_STATUSES } },
  });
}

export function validateSupportCreateInput(input: {
  category: string;
  subject: string;
  message: string;
}): string | null {
  if (!isSupportCategory(input.category)) return "Categoría inválida";
  const subject = input.subject.trim();
  const message = input.message.trim();
  if (subject.length < 3) return "El asunto es demasiado corto";
  if (subject.length > 120) return "El asunto es demasiado largo";
  if (message.length < 10) return "Describe el problema con al menos 10 caracteres";
  if (message.length > 4000) return "El mensaje es demasiado largo";
  return null;
}

export function validateSupportMessage(body: string): string | null {
  const trimmed = body.trim();
  if (trimmed.length < 2) return "El mensaje es demasiado corto";
  if (trimmed.length > 4000) return "El mensaje es demasiado largo";
  return null;
}

export function validateSupportStatus(status: string): status is SupportStatus {
  return isSupportStatus(status);
}
