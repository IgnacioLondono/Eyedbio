import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { getTemplateByIdOrSlug } from "@/lib/templates/template-service";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const site = await getSiteSettings();
  if (!site.marketplaceEnabled) {
    return NextResponse.json({ error: "Marketplace desactivado" }, { status: 404 });
  }

  const { id } = await params;
  const template = await getTemplateByIdOrSlug(id);
  if (!template) {
    return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
  }

  const session = await auth();
  const isOwner = Boolean(session?.user?.id && template.authorId === session.user.id);
  if (!template.published && !isOwner) {
    return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ template });
}
