import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin-guard";
import { listAdminSupportTickets } from "@/lib/support";

export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "all";
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  try {
    const data = await listAdminSupportTickets({
      status,
      q,
      page: Number.isNaN(page) ? 1 : page,
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar los tickets" }, { status: 500 });
  }
}
