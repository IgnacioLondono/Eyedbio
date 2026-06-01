import { NextResponse } from "next/server";
import { fetchRecentReviews } from "@/lib/reviews";

export async function GET() {
  try {
    const reviews = await fetchRecentReviews();
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("[reviews/recent]", err);
    return NextResponse.json({ reviews: [] });
  }
}
