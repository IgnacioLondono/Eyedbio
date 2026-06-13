import { NextResponse } from "next/server";
import {
  fetchLanyardPresence,
  formatPresenceActivity,
  isValidDiscordUserId,
  discordAvatarUrl,
  discordDisplayName,
  discordStatusColor,
} from "@/lib/lanyard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { userId } = await params;

  if (!isValidDiscordUserId(userId)) {
    return NextResponse.json({ error: "ID de Discord inválido" }, { status: 400 });
  }

  try {
    const presence = await fetchLanyardPresence(userId);
    if (!presence) {
      return NextResponse.json(
        { error: "Presencia no disponible. ¿Tienes Lanyard activado?" },
        { status: 404 }
      );
    }

    const user = presence.discord_user;

    return NextResponse.json(
      {
        userId: user.id,
        username: user.username,
        displayName: discordDisplayName(user),
        avatarUrl: discordAvatarUrl(user),
        status: presence.discord_status,
        statusColor: discordStatusColor(presence.discord_status),
        activityEs: formatPresenceActivity(presence, "es"),
        activityEn: formatPresenceActivity(presence, "en"),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Error al obtener presencia" }, { status: 502 });
  }
}
