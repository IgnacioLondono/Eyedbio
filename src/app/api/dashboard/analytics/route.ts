import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { userToProfile } from "@/lib/profile/profile-mapper";
import { fetchDashboardAnalytics } from "@/lib/dashboard/profile-analytics";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { links: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const profile = userToProfile(user);
  const analytics = await fetchDashboardAnalytics(user.id, profile);
  return NextResponse.json(analytics);
}
