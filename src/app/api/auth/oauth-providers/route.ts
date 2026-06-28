import { NextResponse } from "next/server";
import { getEnabledOAuthProviderIds } from "@/lib/auth/oauth-providers";

export async function GET() {
  return NextResponse.json({ providers: getEnabledOAuthProviderIds() });
}
