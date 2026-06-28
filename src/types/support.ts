import type { SupportCategory, SupportStatus } from "@/lib/config/support-config";

export interface SupportMessageRow {
  id: string;
  authorId: string | null;
  isStaff: boolean;
  body: string;
  createdAt: string;
}

export interface SupportTicketSummary {
  id: string;
  category: SupportCategory;
  subject: string;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string;
}

export interface SupportTicketDetail extends SupportTicketSummary {
  messages: SupportMessageRow[];
}

export interface AdminSupportTicketRow extends SupportTicketSummary {
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
  };
}
