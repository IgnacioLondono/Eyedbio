import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  fetchProfileReviews,
  mapReview,
  normalizeReviewComment,
  validateReviewComment,
  validateReviewRating,
} from "@/lib/reviews";
import { REVIEW_PAGE_SIZE } from "@/lib/reviews-config";

interface Props {
  params: Promise<{ username: string }>;
}

async function resolveProfileUser(username: string) {
  return prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, username: true },
  });
}

export async function GET(request: Request, { params }: Props) {
  const { username } = await params;
  const profileUser = await resolveProfileUser(username);

  if (!profileUser) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limitParam = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, REVIEW_PAGE_SIZE)
      : REVIEW_PAGE_SIZE;

  const session = await auth();

  try {
    const data = await fetchProfileReviews(profileUser.id, {
      cursor,
      limit,
      viewerId: session?.user?.id,
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar las reseñas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Inicia sesión para dejar una reseña" }, { status: 401 });
  }

  const { username } = await params;
  const profileUser = await resolveProfileUser(username);

  if (!profileUser) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  if (profileUser.id === session.user.id) {
    return NextResponse.json({ error: "No puedes reseñar tu propio perfil" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const ratingError = validateReviewRating(body.rating);
    if (ratingError) {
      return NextResponse.json({ error: ratingError }, { status: 400 });
    }

    const comment = normalizeReviewComment(body.comment);
    const commentError = validateReviewComment(comment);
    if (commentError) {
      return NextResponse.json({ error: commentError }, { status: 400 });
    }

    const rating = Number(body.rating);

    const review = await prisma.profileReview.upsert({
      where: {
        reviewerId_profileUserId: {
          reviewerId: session.user.id,
          profileUserId: profileUser.id,
        },
      },
      create: {
        reviewerId: session.user.id,
        profileUserId: profileUser.id,
        rating,
        comment,
      },
      update: {
        rating,
        comment,
      },
      include: {
        reviewer: {
          select: { username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    revalidateTag("recent-profile-reviews", "max");

    const data = await fetchProfileReviews(profileUser.id, {
      limit: REVIEW_PAGE_SIZE,
      viewerId: session.user.id,
    });

    return NextResponse.json({
      review: mapReview(review),
      ...data,
    });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la reseña" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { username } = await params;
  const profileUser = await resolveProfileUser(username);

  if (!profileUser) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  try {
    await prisma.profileReview.deleteMany({
      where: {
        reviewerId: session.user.id,
        profileUserId: profileUser.id,
      },
    });

    revalidateTag("recent-profile-reviews", "max");

    const data = await fetchProfileReviews(profileUser.id, {
      limit: REVIEW_PAGE_SIZE,
      viewerId: session.user.id,
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar la reseña" }, { status: 500 });
  }
}
