import { NextResponse } from "next/server";
import {
  listPublicProfiles,
  type ProfileDirectorySort,
} from "@/lib/profile-directory";

export const dynamic = "force-dynamic";

const VALID_SORTS = new Set<ProfileDirectorySort>(["views", "recent", "name"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sortParam = searchParams.get("sort") ?? "views";
  const sort = VALID_SORTS.has(sortParam as ProfileDirectorySort)
    ? (sortParam as ProfileDirectorySort)
    : "views";
  const limit = Number(searchParams.get("limit") ?? "48");
  const offset = Number(searchParams.get("offset") ?? "0");

  try {
    const result = await listPublicProfiles({ sort, limit, offset });
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo cargar el directorio de perfiles" },
      { status: 500 }
    );
  }
}
