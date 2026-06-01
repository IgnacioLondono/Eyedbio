import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAdminEnvEmail,
  isAdminConfigured,
  maskAdminEmail,
} from "@/lib/admin-credentials";
import { describeMailConfig, isMailConfigured } from "@/lib/mail-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");

    let reviewsTable = "unknown";
    try {
      await prisma.profileReview.findFirst({ select: { id: true } });
      reviewsTable = "ok";
    } catch {
      reviewsTable = "missing_migration";
    }

    const adminEmail = getAdminEnvEmail();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      reviewsTable,
      admin: {
        configured: isAdminConfigured(),
        email: adminEmail ? maskAdminEmail(adminEmail) : null,
      },
      email: isMailConfigured() ? "configured" : "not_configured",
      emailProvider: describeMailConfig(),
    });
  } catch (err) {
    console.error("[health]", err);
    return NextResponse.json(
      { status: "error", database: "disconnected" },
      { status: 503 }
    );
  }
}
