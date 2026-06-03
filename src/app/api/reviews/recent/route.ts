import { NextResponse } from "next/server";
import { fetchRecentReviews } from "@/lib/reviews";
import { getSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const site = await getSiteSettings();
  if (!site.profileReviewsEnabled) {
    return NextResponse.json({ reviews: [] });
  }

  try {
    const reviews = await fetchRecentReviews();
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("[reviews/recent]", err);
    return NextResponse.json({ reviews: [] });
  }
}
