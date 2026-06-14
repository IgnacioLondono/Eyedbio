import { NextResponse } from "next/server";
import { getEnabledOAuthProviderIds } from "@/lib/oauth-providers";

export async function GET() {
  return NextResponse.json({ providers: getEnabledOAuthProviderIds() });
}
