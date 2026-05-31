import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { EXT_TO_MIME } from "@/lib/media-config";

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

interface Props {
  params: Promise<{ path: string[] }>;
}

export async function GET(_request: Request, { params }: Props) {
  const segments = (await params).path;

  if (!segments || segments.length !== 2) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const [userId, filename] = segments;

  if (filename.includes("..") || userId.includes("..")) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const filePath = path.join(UPLOAD_ROOT, userId, filename);
  const ext = path.extname(filename).toLowerCase();

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": EXT_TO_MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
