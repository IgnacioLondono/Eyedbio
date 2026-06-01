import { createWriteStream } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { BackgroundType } from "@/types/profile";
import {
  UploadKind,
  UPLOAD_LIMITS,
  buildMediaUrl,
  isUploadAllowed,
  MIME_TO_EXT,
} from "@/lib/media-config";

export type { UploadKind };

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

/** Archivos pequeños: escritura directa (menos overhead que streaming). */
const DIRECT_WRITE_MAX_BYTES = 8 * 1024 * 1024;

const WRITE_STREAM_HIGH_WATER_MARK = 512 * 1024;

export function getBackgroundType(mime: string, filename: string): BackgroundType {
  const ext = path.extname(filename).toLowerCase();
  if (mime.startsWith("video/") || ext === ".mp4" || ext === ".webm" || ext === ".mov") {
    return "video";
  }
  if (mime === "image/gif" || ext === ".gif") return "gif";
  return "image";
}

export function validateUpload(kind: UploadKind, file: File) {
  if (!isUploadAllowed(kind, file)) {
    return `Tipo de archivo no permitido para ${kind}`;
  }
  if (file.size > UPLOAD_LIMITS[kind]) {
    return `El archivo supera el límite de ${Math.round(UPLOAD_LIMITS[kind] / 1024 / 1024)}MB`;
  }
  return null;
}

/** Escribe el archivo en disco por streaming (menor uso de RAM en archivos grandes). */
export async function saveUpload(userId: string, kind: UploadKind, file: File) {
  const ext =
    path.extname(file.name).toLowerCase() ||
    MIME_TO_EXT[file.type] ||
    "";
  const filename = `${kind}-${Date.now()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, userId);
  const filePath = path.join(dir, filename);

  await mkdir(dir, { recursive: true });

  if (file.size <= DIRECT_WRITE_MAX_BYTES) {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
  } else {
    const nodeStream = Readable.fromWeb(
      file.stream() as Parameters<typeof Readable.fromWeb>[0]
    );
    await pipeline(
      nodeStream,
      createWriteStream(filePath, { highWaterMark: WRITE_STREAM_HIGH_WATER_MARK })
    );
  }

  return {
    url: buildMediaUrl(userId, filename),
    backgroundType:
      kind === "background" ? getBackgroundType(file.type, file.name) : undefined,
  };
}
