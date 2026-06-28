import { User } from "@/generated/prisma/client";
import {
  LANDING_RECENT_REVIEWS_LIMIT,
  REVIEW_COMMENT_MAX_LENGTH,
  REVIEW_RATING_MAX,
  REVIEW_RATING_MIN,
} from "@/lib/config/reviews-config";
import { isPrismaSchemaMismatch } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import { ProfileReview, ReviewSummary, ReviewUserSnippet } from "@/types/review";

const EMPTY_SUMMARY: ReviewSummary = { averageRating: 0, count: 0 };

type ReviewerFields = Pick<User, "username" | "displayName" | "avatarUrl">;

type ReviewWithRelations = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewer: ReviewerFields;
  profileUser?: ReviewerFields;
};

function avatarForUser(user: ReviewerFields): string {
  return (
    user.avatarUrl ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
  );
}

function toUserSnippet(user: ReviewerFields): ReviewUserSnippet {
  return {
    username: user.username,
    displayName: user.displayName,
    avatarUrl: avatarForUser(user),
  };
}

export function mapReview(row: ReviewWithRelations): ProfileReview {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    reviewer: toUserSnippet(row.reviewer),
    profile: row.profileUser ? toUserSnippet(row.profileUser) : undefined,
  };
}

export function validateReviewRating(rating: unknown): string | null {
  const value = Number(rating);
  if (!Number.isInteger(value) || value < REVIEW_RATING_MIN || value > REVIEW_RATING_MAX) {
    return `La valoración debe ser entre ${REVIEW_RATING_MIN} y ${REVIEW_RATING_MAX} estrellas`;
  }
  return null;
}

export function normalizeReviewComment(comment: unknown): string | null {
  if (comment === undefined || comment === null || comment === "") return null;
  const trimmed = String(comment).trim();
  return trimmed || null;
}

export function validateReviewComment(comment: string | null): string | null {
  if (comment && comment.length > REVIEW_COMMENT_MAX_LENGTH) {
    return `El comentario no puede superar ${REVIEW_COMMENT_MAX_LENGTH} caracteres`;
  }
  return null;
}

export async function getReviewSummary(profileUserId: string): Promise<ReviewSummary> {
  try {
    const agg = await prisma.profileReview.aggregate({
      where: { profileUserId },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const count = agg._count._all;
    const averageRating =
      count > 0 && agg._avg.rating != null
        ? Math.round(agg._avg.rating * 10) / 10
        : 0;

    return { averageRating, count };
  } catch (err) {
    if (isPrismaSchemaMismatch(err)) return EMPTY_SUMMARY;
    throw err;
  }
}

const reviewInclude = {
  reviewer: {
    select: { username: true, displayName: true, avatarUrl: true },
  },
} as const;

export async function fetchProfileReviews(
  profileUserId: string,
  options: { cursor?: string; limit: number; viewerId?: string }
) {
  const { cursor, limit, viewerId } = options;

  try {
    return await fetchProfileReviewsQuery(profileUserId, { cursor, limit, viewerId });
  } catch (err) {
    if (isPrismaSchemaMismatch(err)) {
      return {
        summary: EMPTY_SUMMARY,
        reviews: [],
        nextCursor: null,
        myReview: null,
      };
    }
    throw err;
  }
}

async function fetchProfileReviewsQuery(
  profileUserId: string,
  options: { cursor?: string; limit: number; viewerId?: string }
) {
  const { cursor, limit, viewerId } = options;

  const reviews = await prisma.profileReview.findMany({
    where: { profileUserId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    include: reviewInclude,
  });

  const hasMore = reviews.length > limit;
  const page = hasMore ? reviews.slice(0, limit) : reviews;

  let myReview: ProfileReview | null = null;
  if (viewerId) {
    const own = await prisma.profileReview.findUnique({
      where: {
        reviewerId_profileUserId: {
          reviewerId: viewerId,
          profileUserId,
        },
      },
      include: reviewInclude,
    });
    if (own) myReview = mapReview(own);
  }

  const summary = await getReviewSummary(profileUserId);

  return {
    summary,
    reviews: page.map(mapReview),
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
    myReview,
  };
}

export async function fetchRecentReviews(limit = LANDING_RECENT_REVIEWS_LIMIT) {
  try {
    const rows = await prisma.profileReview.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      include: {
        ...reviewInclude,
        profileUser: {
          select: { username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    return rows.map((row) =>
      mapReview({
        ...row,
        profileUser: row.profileUser,
      })
    );
  } catch (err) {
    if (isPrismaSchemaMismatch(err)) return [];
    throw err;
  }
}
