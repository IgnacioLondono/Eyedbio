import { getPublicProfile } from "@/lib/profile/get-public-profile";
import {
  pngResponse,
  renderFallbackStoryPng,
  renderStoryPng,
} from "@/lib/render-og-png";
import { getSiteUrlFromHeaders, profilePublicUrl } from "@/lib/config/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const siteUrl = await getSiteUrlFromHeaders();
    const profile = await getPublicProfile(username);
    const profileUrl = profilePublicUrl(username, siteUrl);

    if (!profile) {
      const png = await renderFallbackStoryPng();
      return pngResponse(png);
    }

    const png = await renderStoryPng(profile, siteUrl, profileUrl);
    return pngResponse(png);
  } catch (error) {
    console.error("[story-image] generation failed:", error);
    const png = await renderFallbackStoryPng();
    return pngResponse(png, 300);
  }
}
