import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserBlocked } from "@/lib/auth-user";
import { safeRevalidateTag } from "@/lib/cache-utils";
import { prisma } from "@/lib/prisma";
import { profileCacheTag } from "@/lib/cached-profile";
import { validateSocialLinksCount } from "@/lib/links-config";
import { saveUserProfile } from "@/lib/profile-save";
import { userToProfile } from "@/lib/profile-mapper";
import { ensureDiscordUserIdSynced } from "@/lib/discord-account";
import { resolveAudioSource } from "@/lib/profile-audio";
import { DEFAULT_CLIP_DURATION, isFullAudioClip } from "@/lib/audio-config";
import { Profile, type AudioSource } from "@/types/profile";
import { getSiteSettings } from "@/lib/site-settings";

async function rejectIfBlocked(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { blockedAt: true },
  });
  if (!user || isUserBlocked(user)) {
    return NextResponse.json(
      { error: "Tu cuenta está bloqueada. Contacta con soporte." },
      { status: 403 }
    );
  }
  return null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const blocked = await rejectIfBlocked(session.user.id);
  if (blocked) return blocked;

  await ensureDiscordUserIdSynced(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { links: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json(userToProfile(user));
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const blocked = await rejectIfBlocked(session.user.id);
  if (blocked) return blocked;

  try {
    const profile = (await request.json()) as Profile;

    if (typeof profile.audioStartTime !== "number" || Number.isNaN(profile.audioStartTime)) {
      const fromSettings = profile.settings?.audioStartTime;
      profile.audioStartTime =
        typeof fromSettings === "number" && !Number.isNaN(fromSettings) ? fromSettings : 0;
    } else {
      profile.audioStartTime = Math.max(0, profile.audioStartTime);
    }

    if (typeof profile.audioClipDuration !== "number" || Number.isNaN(profile.audioClipDuration)) {
      const fromSettings = profile.settings?.audioClipDuration;
      profile.audioClipDuration =
        typeof fromSettings === "number" && !Number.isNaN(fromSettings)
          ? fromSettings
          : DEFAULT_CLIP_DURATION;
    }

    const rawClip = Number(profile.audioClipDuration);
    profile.audioClipDuration = isFullAudioClip(rawClip) || Number.isNaN(rawClip) ? 0 : rawClip;

    const linksError = validateSocialLinksCount(profile.links ?? []);
    if (linksError) {
      return NextResponse.json({ error: linksError }, { status: 400 });
    }

    const site = await getSiteSettings();
    if (!site.profileAudioEnabled) {
      const current = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          audioUrl: true,
          audioEnabled: true,
          audioStartTime: true,
          audioClipDuration: true,
          audioSource: true,
          backgroundUrl: true,
          backgroundType: true,
          settings: true,
        },
      });
      if (current) {
        profile.audioUrl = current.audioUrl ?? undefined;
        profile.audioEnabled = current.audioEnabled;
        profile.audioStartTime = current.audioStartTime ?? 0;
        profile.audioClipDuration = current.audioClipDuration ?? 30;
        profile.audioSource = resolveAudioSource(
          current.audioSource as AudioSource | undefined,
          profile
        );
      }
    }

    const result = await saveUserProfile(
      session.user.id,
      profile,
      profile.updatedAt
    );

    if (!result.ok) {
      if (result.conflict) {
        return NextResponse.json(
          {
            error:
              "El perfil cambió en otra pestaña o dispositivo. Recarga y vuelve a guardar.",
            code: "PROFILE_CONFLICT",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    safeRevalidateTag(profileCacheTag(result.profile.username));

    return NextResponse.json(result.profile);
  } catch {
    return NextResponse.json(
      { error: "Error al guardar el perfil" },
      { status: 500 }
    );
  }
}
