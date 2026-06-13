import { createWriteStream } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { BackgroundType } from "@/types/profile";
import {
  UploadKind,
  buildMediaUrl,
  getUploadValidationError,
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

function resolveUploadExtension(
  kind: UploadKind,
  file: Pick<File, "name" | "type">
): string {
  const fromName = path.extname(file.name).toLowerCase();
  if (fromName) return fromName;

  const fromMime = MIME_TO_EXT[file.type];
  if (fromMime) return fromMime;

  if (kind === "background" && file.type.startsWith("video/")) return ".mp4";

  return "";
}

export function validateUpload(kind: UploadKind, file: File) {
  const error = getUploadValidationError(kind, file);
  if (!error) return null;
  if (error.code === "size") {
    return `El archivo supera el límite de ${error.limitMb}MB`;
  }
  return `Tipo de archivo no permitido para ${kind}`;
}

export async function saveUploadBuffer(
  userId: string,
  kind: UploadKind,
  buffer: Buffer,
  options: { ext: string; mime?: string; originalName?: string }
) {
  const ext = options.ext.startsWith(".") ? options.ext : `.${options.ext}`;
  const filename = `${kind}-${Date.now()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, userId);
  const filePath = path.join(dir, filename);

  await mkdir(dir, { recursive: true });
  await writeFile(filePath, buffer);

  const mime = options.mime ?? "";
  const name = options.originalName ?? `file${ext}`;

  return {
    url: buildMediaUrl(userId, filename),
    backgroundType:
      kind === "background" ? getBackgroundType(mime, name) : undefined,
  };
}

/** Escribe el archivo en disco por streaming (menor uso de RAM en archivos grandes). */
export async function saveUpload(userId: string, kind: UploadKind, file: File) {
  const ext = resolveUploadExtension(kind, file);
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
