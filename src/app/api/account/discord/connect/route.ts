import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  isDiscordLinkAvailable,
  isDiscordOAuthAvailable,
} from "@/lib/auth/discord-account";
import { setDiscordLinkIntent } from "@/lib/auth/discord-link-intent";
import { buildEyedBotLinkStartUrl } from "@/lib/discord/eyedbot-link";
import { absoluteUrl } from "@/lib/config/site-url";

function redirect(path: string): NextResponse {
  return NextResponse.redirect(absoluteUrl(path));
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/login?callbackUrl=/dashboard?tab=general");
  }

  if (!isDiscordLinkAvailable()) {
    return redirect("/dashboard?tab=general&discordError=unavailable");
  }

  await setDiscordLinkIntent(session.user.id);

  const eyedBotUrl = buildEyedBotLinkStartUrl(session.user.id);
  if (eyedBotUrl) {
    return NextResponse.redirect(eyedBotUrl);
  }

  if (!isDiscordOAuthAvailable()) {
    return redirect("/dashboard?tab=general&discordError=unavailable");
  }

  const callbackUrl = absoluteUrl("/dashboard?tab=general&discordLinked=1");
  const signInUrl = new URL("/api/auth/signin/discord", absoluteUrl("/"));
  signInUrl.searchParams.set("callbackUrl", callbackUrl);

  return NextResponse.redirect(signInUrl.toString());
}
