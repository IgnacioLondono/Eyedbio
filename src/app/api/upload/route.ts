import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUpload, UploadKind, validateUpload } from "@/lib/upload";
import { getSiteSettings } from "@/lib/site-settings";
import {
  ImageModerationError,
  moderateUploadFile,
} from "@/lib/image-moderation";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

function moderationMessage(err: ImageModerationError): string {
  if (err.reason === "nsfw") {
    return "La imagen no cumple las normas de contenido (desnudo o contenido sexual no permitido).";
  }
  return err.message;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = formData.get("kind") as UploadKind;

    if (!(file instanceof File) || !kind) {
      return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
    }

    if (kind === "audio") {
      const site = await getSiteSettings();
      if (!site.profileAudioEnabled) {
        return NextResponse.json(
          { error: "El audio en perfiles no está disponible" },
          { status: 403 }
        );
      }
    }

    const error = validateUpload(kind, file);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    try {
      await moderateUploadFile(file, kind);
    } catch (err) {
      if (err instanceof ImageModerationError) {
        return NextResponse.json({ error: moderationMessage(err) }, { status: 422 });
      }
      throw err;
    }

    const result = await saveUpload(session.user.id, kind, file);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    );
  }
}
