import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { EXT_TO_MIME } from "@/lib/media/media-config";

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

interface Props {
  params: Promise<{ path: string[] }>;
}

function parseRange(
  rangeHeader: string,
  fileSize: number
): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!match) return null;

  let start = match[1] ? Number.parseInt(match[1], 10) : 0;
  let end = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1;

  if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || start >= fileSize) {
    return null;
  }

  end = Math.min(end, fileSize - 1);
  if (end < start) return null;

  return { start, end };
}

export async function GET(request: Request, { params }: Props) {
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
  const contentType = EXT_TO_MIME[ext] ?? "application/octet-stream";

  try {
    const fileStat = await stat(filePath);
    const fileSize = fileStat.size;
    const rangeHeader = request.headers.get("range");

    if (rangeHeader) {
      const range = parseRange(rangeHeader, fileSize);
      if (!range) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      const { start, end } = range;
      const chunkLength = end - start + 1;
      const stream = createReadStream(filePath, { start, end });

      return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(chunkLength),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const stream = createReadStream(filePath);
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
