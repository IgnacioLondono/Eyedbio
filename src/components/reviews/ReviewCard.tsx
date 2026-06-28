"use client";

import Image from "next/image";
import Link from "next/link";
import { ProfileReview } from "@/types/review";
import StarRating from "@/components/shared/StarRating";
import { getMediaSrc } from "@/lib/media/media-url";

interface Props {
  review: ProfileReview;
  showProfile?: boolean;
  compact?: boolean;
}

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ReviewCard({ review, showProfile = false, compact = false }: Props) {
  const target = showProfile && review.profile ? review.profile : review.reviewer;
  const targetLabel = showProfile && review.profile ? "Perfil reseñado" : "Reseñado por";

  return (
    <article
      className={`rounded-xl border border-white/10 bg-white/[0.04] ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start gap-3">
        <Link
          href={`/${target.username}`}
          className="relative shrink-0 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-purple-400/40 transition-all"
        >
          <Image
            src={getMediaSrc(target.avatarUrl)}
            alt={target.displayName}
            width={compact ? 36 : 44}
            height={compact ? 36 : 44}
            className={`${compact ? "w-9 h-9" : "w-11 h-11"} object-cover`}
            unoptimized
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/${target.username}`}
              className="font-medium text-white hover:text-purple-300 transition-colors truncate"
            >
              {target.displayName}
            </Link>
            <span className="text-white/30 text-xs">@{target.username}</span>
          </div>
          <p className="text-[10px] uppercase tracking-wide text-white/35 mt-0.5">{targetLabel}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StarRating value={review.rating} size="sm" />
            <time className="text-white/35 text-xs" dateTime={review.createdAt}>
              {formatReviewDate(review.createdAt)}
            </time>
          </div>

          {review.comment ? (
            <p
              className={`text-white/60 mt-2 leading-relaxed ${
                compact ? "text-xs line-clamp-3" : "text-sm"
              }`}
            >
              {review.comment}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
