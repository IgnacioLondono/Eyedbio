import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  ensureDiscordUserIdSynced,
  getLinkedDiscordAccount,
  isDiscordLinkAvailable,
  unlinkDiscordAccount,
} from "@/lib/auth/discord-account";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const available = isDiscordLinkAvailable();
  const linked = await getLinkedDiscordAccount(session.user.id);
  const discordUserId =
    (await ensureDiscordUserIdSynced(session.user.id)) ??
    linked?.providerAccountId ??
    null;

  return NextResponse.json({
    available,
    linked: Boolean(linked),
    discordUserId,
  });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await unlinkDiscordAccount(session.user.id);

  if (!result.ok) {
    const message =
      result.error === "ONLY_LOGIN_METHOD"
        ? "No puedes desvincular Discord si es tu único método de acceso."
        : "No hay cuenta de Discord vinculada.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
