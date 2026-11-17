import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getSiteSettings } from "@/lib/site-settings";
import {
  createUserTemplate,
  listPublishedTemplates,
} from "@/lib/templates/template-service";
import type { ProfileSettings } from "@/types/profile";

export async function GET(request: Request) {
  const site = await getSiteSettings();
  if (!site.marketplaceEnabled) {
    return NextResponse.json({ error: "Marketplace desactivado" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const mine = searchParams.get("mine") === "1";

  const session = await auth();
  const templates = await listPublishedTemplates({
    category,
    q,
    mineUserId: session?.user?.id,
    includeUnpublishedMine: mine && Boolean(session?.user?.id),
  });

  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const site = await getSiteSettings();
  if (!site.marketplaceEnabled) {
    return NextResponse.json({ error: "Marketplace desactivado" }, { status: 404 });
  }

  let body: {
    title?: string;
    description?: string;
    settings?: Partial<ProfileSettings>;
    previewUrl?: string | null;
    category?: string;
    tags?: string[];
    publish?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.settings || typeof body.settings !== "object") {
    return NextResponse.json({ error: "Faltan settings de estilo" }, { status: 400 });
  }

  try {
    const template = await createUserTemplate({
      userId: session.user.id,
      title: body.title ?? "",
      description: body.description,
      settings: body.settings,
      previewUrl: body.previewUrl,
      category: body.category,
      tags: body.tags,
      publish: body.publish,
    });
    return NextResponse.json({ template }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "TITLE_REQUIRED") {
      return NextResponse.json({ error: "Título demasiado corto" }, { status: 400 });
    }
    console.error("[templates POST]", err);
    return NextResponse.json({ error: "No se pudo crear la plantilla" }, { status: 500 });
  }
}
