import { readdir, unlink } from "fs/promises";
import path from "path";
import { buildMediaUrl } from "@/lib/media-config";
import { isLocalMediaUrl } from "@/lib/media-url";
import { resolveAudioSource } from "@/lib/profile-audio";
import type { Profile } from "@/types/profile";

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

function addLocalMediaUrl(urls: Set<string>, url?: string | null) {
  const trimmed = url?.trim();
  if (trimmed && isLocalMediaUrl(trimmed)) {
    urls.add(trimmed);
  }
}

/** URLs de medios locales que el perfil guardado sigue usando. */
export function collectProfileMediaUrls(profile: Profile): Set<string> {
  const urls = new Set<string>();

  addLocalMediaUrl(urls, profile.avatarUrl);
  addLocalMediaUrl(urls, profile.settings.backgroundUrl);
  addLocalMediaUrl(urls, profile.settings.bannerUrl);

  if (resolveAudioSource(profile.audioSource, profile) === "upload") {
    addLocalMediaUrl(urls, profile.audioUrl);
  }

  for (const link of profile.links) {
    addLocalMediaUrl(urls, link.iconUrl);
  }

  return urls;
}

export function mediaUrlToAbsolutePath(
  url: string,
  ownerUserId: string
): string | null {
  if (!isLocalMediaUrl(url)) return null;

  const pathname = url.split("?")[0]?.split("#")[0] ?? "";
  const match = /\/(?:api\/)?media\/([^/]+)\/([^/]+)$/i.exec(pathname);
  if (!match) return null;

  const [, userId, filename] = match;
  if (userId !== ownerUserId) return null;
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return null;
  }

  const userDir = path.resolve(path.join(UPLOAD_ROOT, ownerUserId));
  const filePath = path.resolve(path.join(userDir, filename));

  if (filePath !== userDir && !filePath.startsWith(`${userDir}${path.sep}`)) {
    return null;
  }

  return filePath;
}

async function deleteFileQuietly(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.error("[media-storage] No se pudo eliminar:", filePath, err);
    }
  }
}

export async function deleteLocalMediaUrl(
  url: string | undefined | null,
  ownerUserId: string
): Promise<void> {
  if (!url?.trim()) return;
  const filePath = mediaUrlToAbsolutePath(url.trim(), ownerUserId);
  if (!filePath) return;
  await deleteFileQuietly(filePath);
}

/**
 * Elimina del disco los archivos del usuario que ya no están referenciados en el perfil.
 * Se ejecuta tras guardar: al subir uno nuevo y guardar, el anterior se borra.
 */
export async function syncUserMediaStorage(
  userId: string,
  profile: Profile
): Promise<void> {
  const referenced = collectProfileMediaUrls(profile);
  const userDir = path.join(UPLOAD_ROOT, userId);

  let filenames: string[];
  try {
    filenames = await readdir(userDir);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return;
    throw err;
  }

  await Promise.all(
    filenames.map(async (filename) => {
      if (!filename || filename.includes("..")) return;

      const url = buildMediaUrl(userId, filename);
      if (referenced.has(url)) return;

      await deleteFileQuietly(path.join(userDir, filename));
    })
  );
}
