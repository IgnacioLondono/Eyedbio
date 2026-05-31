import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { describeMailConfig, isMailConfigured } from "@/lib/mail-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return NextResponse.json({
      status: "ok",
      database: "connected",
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
