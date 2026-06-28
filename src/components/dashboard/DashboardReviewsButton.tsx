"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import ReviewsReceivedModal from "@/components/reviews/ReviewsReceivedModal";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import { ReviewSummary } from "@/types/review";

interface Props {
  username: string;
}

export default function DashboardReviewsButton({ username }: Props) {
  const site = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);

  useEffect(() => {
    if (!site.profileReviewsEnabled || !username) return;

    fetch(`/api/profile/${username}/reviews?limit=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => {});
  }, [username, site.profileReviewsEnabled]);

  if (!site.profileReviewsEnabled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs border border-amber-400/25 text-amber-200/90 rounded-lg hover:bg-amber-500/10 transition-colors"
        title="Ver reseñas de tu perfil"
      >
        <Star className="w-3.5 h-3.5 fill-amber-400/80 text-amber-400" />
        <span className="hidden sm:inline">Reseñas</span>
        {summary && summary.count > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
            {summary.count > 99 ? "99+" : summary.count}
          </span>
        ) : null}
      </button>

      <ReviewsReceivedModal
        username={username}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
