import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, blockedAt: true, email: true },
  });

  if (!admin || !isAdminRole(admin.role) || admin.blockedAt) {
    return { error: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) };
  }

  return { session, admin };
}
