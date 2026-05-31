import { getPublicProfile } from "@/lib/get-public-profile";
import {
  createFallbackOgImage,
  createProfileOgImage,
} from "@/lib/generate-profile-og-image";
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

    const response = profile
      ? await createProfileOgImage(profile, siteUrl)
      : createFallbackOgImage();

    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=86400"
    );
    return response;
  } catch (error) {
    console.error("[opengraph-image] generation failed:", error);
    const fallback = createFallbackOgImage();
    fallback.headers.set("Cache-Control", "public, max-age=300");
    return fallback;
  }
}
