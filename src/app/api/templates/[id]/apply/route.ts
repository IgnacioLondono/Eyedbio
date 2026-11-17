import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { applyTemplateToUser } from "@/lib/templates/template-service";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const site = await getSiteSettings();
  if (!site.marketplaceEnabled) {
    return NextResponse.json({ error: "Marketplace desactivado" }, { status: 404 });
  }

  const { id } = await params;
  const result = await applyTemplateToUser(session.user.id, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, profile: result.profile });
}
