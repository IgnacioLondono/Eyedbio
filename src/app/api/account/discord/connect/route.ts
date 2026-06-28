import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setDiscordLinkIntent } from "@/lib/discord-link-intent";
import { isDiscordOAuthAvailable } from "@/lib/discord-account";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login?callbackUrl=/dashboard?tab=general", request.url));
  }

  if (!isDiscordOAuthAvailable()) {
    return NextResponse.redirect(
      new URL("/dashboard?tab=general&discordError=unavailable", request.url)
    );
  }

  await setDiscordLinkIntent(session.user.id);

  const callbackUrl = new URL("/dashboard?tab=general&discordLinked=1", request.url).toString();
  const signInUrl = new URL("/api/auth/signin/discord", request.url);
  signInUrl.searchParams.set("callbackUrl", callbackUrl);

  return NextResponse.redirect(signInUrl);
}
