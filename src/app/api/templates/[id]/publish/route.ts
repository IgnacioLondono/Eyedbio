import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { publishTemplate } from "@/lib/templates/template-service";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const site = await getSiteSettings();
  if (!site.marketplaceEnabled) {
    return NextResponse.json({ error: "Marketplace desactivado" }, { status: 404 });
  }

  let published = true;
  try {
    const body = await request.json();
    if (typeof body.published === "boolean") published = body.published;
  } catch {
    // default publish=true
  }

  const { id } = await params;
  try {
    const template = await publishTemplate(id, session.user.id, published);
    if (!template) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ template });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "FORBIDDEN") {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
      if (err.message === "OFFICIAL_LOCKED") {
        return NextResponse.json({ error: "Las plantillas oficiales no se pueden modificar" }, { status: 400 });
      }
    }
    console.error("[templates publish]", err);
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}
