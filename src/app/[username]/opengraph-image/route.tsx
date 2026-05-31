import { getPublicProfile } from "@/lib/get-public-profile";
import {
  pngResponse,
  renderFallbackOgPng,
  renderProfileOgPng,
} from "@/lib/render-og-png";
import { getSiteUrlFromHeaders } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface Props {
  params: Promise<{ username: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const { username } = await params;
    const siteUrl = await getSiteUrlFromHeaders();

    let profile = null;
    try {
      profile = await getPublicProfile(username);
    } catch (error) {
      console.error("[opengraph-image] profile lookup failed:", error);
    }

    const png = profile
      ? await renderProfileOgPng(profile, siteUrl)
      : await renderFallbackOgPng();

    return pngResponse(png);
  } catch (error) {
    console.error("[opengraph-image] generation failed:", error);
    const png = await renderFallbackOgPng();
    return pngResponse(png, 300);
  }
}
