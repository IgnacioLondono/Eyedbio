import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  isDiscordLinkAvailable,
  isDiscordOAuthAvailable,
} from "@/lib/discord-account";
import { setDiscordLinkIntent } from "@/lib/discord-link-intent";
import { buildEyedBotLinkStartUrl } from "@/lib/eyedbot-link";
import { absoluteUrl } from "@/lib/site-url";

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
