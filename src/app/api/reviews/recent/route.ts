import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { fetchRecentReviews } from "@/lib/reviews";

const getCachedRecentReviews = unstable_cache(
  fetchRecentReviews,
  ["recent-profile-reviews"],
  { revalidate: 60, tags: ["recent-profile-reviews"] }
);

export async function GET() {
  try {
    const reviews = await getCachedRecentReviews();
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar las reseñas" },
      { status: 500 }
    );
  }
}
