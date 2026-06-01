import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { profileToUserUpdateData, userToProfile } from "@/lib/profile-mapper";
import { Profile } from "@/types/profile";

export type SaveProfileResult =
  | { ok: true; profile: Profile }
  | { ok: false; conflict: true }
  | { ok: false; conflict: false; error: string };

export async function saveUserProfile(
  userId: string,
  profile: Profile,
  expectedUpdatedAt?: string
): Promise<SaveProfileResult> {
  const userFields = profileToUserUpdateData(profile);
  const expectedDate = expectedUpdatedAt ? new Date(expectedUpdatedAt) : null;

  if (expectedDate && Number.isNaN(expectedDate.getTime())) {
    return { ok: false, conflict: false, error: "Fecha de versión inválida" };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.user.updateMany({
        where: expectedDate
          ? { id: userId, updatedAt: expectedDate }
          : { id: userId },
        data: userFields,
      });

      if (updateResult.count === 0) {
        const stillExists = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!stillExists) {
          throw new Error("USER_NOT_FOUND");
        }
        return null;
      }

      const existingLinks = await tx.socialLink.findMany({
        where: { userId },
        select: { id: true },
      });
      const incomingIds = new Set(profile.links.map((link) => link.id));
      const toDelete = existingLinks
        .filter((link) => !incomingIds.has(link.id))
        .map((link) => link.id);

      if (toDelete.length > 0) {
        await tx.socialLink.deleteMany({
          where: { id: { in: toDelete }, userId },
        });
      }

      for (let index = 0; index < profile.links.length; index++) {
        const link = profile.links[index];
        const owned = await tx.socialLink.findUnique({
          where: { id: link.id },
          select: { userId: true },
        });

        if (owned && owned.userId !== userId) {
          throw new Error("LINK_FORBIDDEN");
        }

        if (owned) {
          await tx.socialLink.update({
            where: { id: link.id },
            data: {
              platform: link.platform,
              url: link.url,
              label: link.label ?? null,
              iconUrl: link.iconUrl ?? null,
              sortOrder: index,
            },
          });
        } else {
          await tx.socialLink.create({
            data: {
              id: link.id,
              userId,
              platform: link.platform,
              url: link.url,
              label: link.label ?? null,
              iconUrl: link.iconUrl ?? null,
              sortOrder: index,
            },
          });
        }
      }

      return tx.user.findUnique({
        where: { id: userId },
        include: { links: true },
      });
    });

    if (!updated) {
      return { ok: false, conflict: true };
    }

    return { ok: true, profile: userToProfile(updated) };
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "USER_NOT_FOUND") {
        return { ok: false, conflict: false, error: "Usuario no encontrado" };
      }
      if (err.message === "LINK_FORBIDDEN") {
        return { ok: false, conflict: false, error: "Enlace no válido" };
      }
    }

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2002" || err.code === "P2025")
    ) {
      return { ok: false, conflict: true };
    }

    throw err;
  }
}
