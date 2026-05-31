import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUpload, UploadKind, validateUpload } from "@/lib/upload";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

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

    const error = validateUpload(kind, file);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
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
