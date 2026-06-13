import sharp from "sharp";
import type { UploadKind } from "@/lib/media-config";
import { ensureAdminEnvLoaded } from "@/lib/load-admin-env";

export type ModerationRejectReason = "nsfw" | "unavailable";

export class ImageModerationError extends Error {
  constructor(
    message: string,
    public readonly reason: ModerationRejectReason
  ) {
    super(message);
    this.name = "ImageModerationError";
  }
}

const IMAGE_KINDS = new Set<UploadKind>([
  "avatar",
  "background",
  "banner",
  "linkIcon",
  "favicon",
  "profileIcon",
]);

export function uploadKindNeedsImageModeration(kind: UploadKind): boolean {
  return IMAGE_KINDS.has(kind);
}

function moderationEnabled(): boolean {
  const flag = process.env.CONTENT_MODERATION?.trim().toLowerCase();
  return flag === "on" || flag === "true" || flag === "1" || flag === "yes";
}

function getSightengineCredentials(): { user: string; secret: string } | null {
  ensureAdminEnvLoaded();

  const user =
    process.env.SIGHTENGINE_API_USER?.trim() ||
    process.env.SIGHTENGINE_USER?.trim();
  const secret =
    process.env.SIGHTENGINE_API_SECRET?.trim() ||
    process.env.SIGHTENGINE_SECRET?.trim();

  if (user && secret) return { user, secret };
  return null;
}

function hasSightengine(): boolean {
  return getSightengineCredentials() !== null;
}

function hasOpenAi(): boolean {
  ensureAdminEnvLoaded();
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/** Frame estático para moderar GIF o primer fotograma de vídeo. */
export async function extractModerationFrame(
  file: File
): Promise<{ buffer: Buffer; mime: string } | null> {
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return null;
  }

  const input = Buffer.from(await file.arrayBuffer());

  if (file.type.startsWith("video/")) {
    try {
      const png = await sharp(input, { animated: false, limitInputPixels: 4096 * 4096 })
        .png()
        .toBuffer();
      return { buffer: png, mime: "image/png" };
    } catch {
      return null;
    }
  }

  if (file.type === "image/gif") {
    try {
      const png = await sharp(input, { animated: false, pages: 1 })
        .png()
        .toBuffer();
      return { buffer: png, mime: "image/png" };
    } catch {
      return { buffer: input, mime: file.type };
    }
  }

  if (file.type.startsWith("image/")) {
    return { buffer: input, mime: file.type };
  }

  return null;
}

function sightengineBlocked(payload: {
  nudity?: {
    raw?: number;
    sexual_activity?: number;
    sexual_display?: number;
    erotica?: number;
  };
}): boolean {
  const n = payload.nudity;
  if (!n) return false;
  return (
    (n.raw ?? 0) >= 0.55 ||
    (n.sexual_activity ?? 0) >= 0.45 ||
    (n.sexual_display ?? 0) >= 0.45 ||
    (n.erotica ?? 0) >= 0.65
  );
}

async function moderateWithSightengine(buffer: Buffer, mime: string): Promise<void> {
  const creds = getSightengineCredentials();
  if (!creds) {
    throw new ImageModerationError(
      "Credenciales de Sightengine no configuradas",
      "unavailable"
    );
  }
  const { user, secret } = creds;

  const form = new FormData();
  form.append("api_user", user);
  form.append("api_secret", secret);
  form.append("models", "nudity");
  form.append("media", new Blob([new Uint8Array(buffer)], { type: mime }), "frame.png");

  const res = await fetch("https://api.sightengine.com/1.0/check.json", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(25_000),
  });

  const data = (await res.json()) as {
    status?: string;
    error?: { message?: string };
    nudity?: {
      raw?: number;
      sexual_activity?: number;
      sexual_display?: number;
      erotica?: number;
    };
  };

  if (!res.ok || data.status === "failure") {
    throw new ImageModerationError(
      data.error?.message ?? "No se pudo verificar el contenido de la imagen",
      "unavailable"
    );
  }

  if (sightengineBlocked(data)) {
    throw new ImageModerationError(
      "La imagen no cumple las normas de contenido de la plataforma",
      "nsfw"
    );
  }
}

async function moderateWithOpenAi(buffer: Buffer, mime: string): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY!.trim();
  const model = process.env.OPENAI_MODERATION_MODEL?.trim() || "gpt-4o-mini";
  const base64 = buffer.toString("base64");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 8,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "¿La imagen contiene desnudo, pornografía, actividad sexual explícita o contenido sexual no permitido en una plataforma pública familiar? Responde solo SI o NO.",
            },
            {
              type: "image_url",
              image_url: { url: `data:${mime};base64,${base64}` },
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(30_000),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };

  if (!res.ok) {
    throw new ImageModerationError(
      data.error?.message ?? "No se pudo verificar el contenido de la imagen",
      "unavailable"
    );
  }

  const answer = data.choices?.[0]?.message?.content?.trim().toUpperCase() ?? "";
  if (answer.startsWith("SI") || answer.startsWith("SÍ") || answer === "YES") {
    throw new ImageModerationError(
      "La imagen no cumple las normas de contenido de la plataforma",
      "nsfw"
    );
  }
}

/**
 * Analiza una imagen antes de guardarla si CONTENT_MODERATION=on y hay Sightengine u OpenAI.
 */
export async function moderateImageBuffer(buffer: Buffer, mime: string): Promise<void> {
  ensureAdminEnvLoaded();

  if (hasSightengine()) {
    await moderateWithSightengine(buffer, mime);
    return;
  }

  if (hasOpenAi()) {
    await moderateWithOpenAi(buffer, mime);
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new ImageModerationError(
      "La moderación no está activa en el servidor. Añade SIGHTENGINE_API_USER y SIGHTENGINE_API_SECRET en Portainer (servicio eyed-bio) y reinicia el contenedor.",
      "unavailable"
    );
  }
}

async function moderateVideoWithSightengine(file: File): Promise<void> {
  const creds = getSightengineCredentials();
  if (!creds) return;
  const { user, secret } = creds;

  const form = new FormData();
  form.append("api_user", user);
  form.append("api_secret", secret);
  form.append("models", "nudity");
  form.append("media", file, file.name);

  const res = await fetch("https://api.sightengine.com/1.0/video/check-sync.json", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(90_000),
  });

  const data = (await res.json()) as {
    status?: string;
    error?: { message?: string };
    nudity?: {
      raw?: number;
      sexual_activity?: number;
      sexual_display?: number;
      erotica?: number;
    };
  };

  if (!res.ok || data.status === "failure") {
    throw new ImageModerationError(
      data.error?.message ?? "No se pudo verificar el contenido del vídeo",
      "unavailable"
    );
  }

  if (sightengineBlocked(data)) {
    throw new ImageModerationError(
      "El vídeo no cumple las normas de contenido de la plataforma",
      "nsfw"
    );
  }
}

export async function moderateUploadFile(file: File, kind: UploadKind): Promise<void> {
  if (!uploadKindNeedsImageModeration(kind)) return;
  if (!moderationEnabled()) return;
  ensureAdminEnvLoaded();

  const frame = await extractModerationFrame(file);
  if (frame) {
    await moderateImageBuffer(frame.buffer, frame.mime);
    return;
  }

  if (file.type.startsWith("video/") && hasSightengine()) {
    await moderateVideoWithSightengine(file);
  }
}
