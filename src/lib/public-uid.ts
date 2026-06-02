import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/generated/prisma/client";

type DbClient = PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export function formatPublicUid(serial: number | bigint): string {
  return `EYE-${String(serial).padStart(6, "0")}`;
}

export async function issueNextPublicUid(client: DbClient = prisma): Promise<string> {
  const rows = await client.$queryRaw<{ uid: string }[]>`
    SELECT 'EYE-' || LPAD(nextval('user_public_uid_seq')::text, 6, '0') AS uid
  `;
  const uid = rows[0]?.uid;
  if (!uid) throw new Error("No se pudo generar el UID público");
  return uid;
}

/** Asigna UID a cuentas antiguas que aún no lo tengan. */
export async function ensureUserPublicUid(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { publicUid: true },
  });
  if (existing?.publicUid) return existing.publicUid;

  const uid = await issueNextPublicUid();
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { publicUid: uid },
      select: { publicUid: true },
    });
    return updated.publicUid;
  } catch {
    const retry = await prisma.user.findUnique({
      where: { id: userId },
      select: { publicUid: true },
    });
    if (retry?.publicUid) return retry.publicUid;
    throw new Error("No se pudo asignar el UID público");
  }
}
