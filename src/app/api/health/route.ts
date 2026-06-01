import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    return NextResponse.json({
      status: "ok",
      database: "connected",
      reviewsTable,
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
