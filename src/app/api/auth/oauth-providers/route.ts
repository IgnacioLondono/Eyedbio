import { NextResponse } from "next/server";
import { getPublicOAuthProviderIds } from "@/lib/auth/oauth-providers";

export async function GET() {
  const providers = await getPublicOAuthProviderIds();
  return NextResponse.json({ providers });
}
