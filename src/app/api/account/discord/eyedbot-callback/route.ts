import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { linkDiscordByProviderId } from "@/lib/auth/discord-account";
import { consumeDiscordLinkIntent } from "@/lib/auth/discord-link-intent";
import { parseEyedBotLinkCallback } from "@/lib/discord/eyedbot-link";
import { absoluteUrl } from "@/lib/config/site-url";

function redirect(path: string): NextResponse {
  return NextResponse.redirect(absoluteUrl(path));
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/login?callbackUrl=/dashboard?tab=general");
  }

  const url = new URL(request.url);
  const parsed = parseEyedBotLinkCallback({
    discordUserId: url.searchParams.get("discordUserId"),
    state: url.searchParams.get("state"),
    sig: url.searchParams.get("sig"),
  });

  if (!parsed) {
    return redirect("/dashboard?tab=general&discordError=invalid");
  }

  if (parsed.userId !== session.user.id) {
    const intentUserId = await consumeDiscordLinkIntent();
    if (intentUserId !== session.user.id) {
      return redirect("/dashboard?tab=general&discordError=session");
    }
  } else {
    await consumeDiscordLinkIntent();
  }

  const result = await linkDiscordByProviderId(session.user.id, parsed.discordUserId);

  if (!result.ok) {
    const code =
      result.error === "ALREADY_LINKED_OTHER" ? "already_linked" : "failed";
    return redirect(`/dashboard?tab=general&discordError=${code}`);
  }

  return redirect("/dashboard?tab=general&discordLinked=1");
}
