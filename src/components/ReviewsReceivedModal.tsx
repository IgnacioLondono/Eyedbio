"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Star, Loader2 } from "lucide-react";
import { ProfileReviewsResponse } from "@/types/review";
import ReviewCard from "@/components/ReviewCard";
import StarRating from "@/components/StarRating";

interface Props {
  username: string;
  open: boolean;
  onClose: () => void;
}

export default function ReviewsReceivedModal({ username, open, onClose }: Props) {
  const [data, setData] = useState<ProfileReviewsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadReviews = useCallback(
    async (cursor?: string) => {
      const url = cursor
        ? `/api/profile/${username}/reviews?cursor=${encodeURIComponent(cursor)}`
        : `/api/profile/${username}/reviews`;

      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al cargar");
      return json as ProfileReviewsResponse;
    },
    [username]
  );

  useEffect(() => {
    if (!open || !username) return;

    setLoading(true);
    setError("");
    loadReviews()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  }, [open, username, loadReviews]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const loadMore = async () => {
    if (!data?.nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const more = await loadReviews(data.nextCursor);
      setData({
        ...more,
        reviews: [...data.reviews, ...more.reviews],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoadingMore(false);
    }
  };

  if (!open) return null;

  const summary = data?.summary ?? { averageRating: 0, count: 0 };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reviews-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 id="reviews-modal-title" className="font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Reseñas recibidas
            </h2>
            {summary.count > 0 ? (
              <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
                <StarRating value={Math.round(summary.averageRating)} size="sm" />
                <span>{summary.averageRating.toFixed(1)} · {summary.count} reseñas</span>
              </div>
            ) : (
              <p className="text-white/40 text-sm mt-1">Aún no tienes reseñas</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : error ? (
            <p className="text-red-400 text-sm text-center py-8">{error}</p>
          ) : data?.reviews.length ? (
            data.reviews.map((review) => <ReviewCard key={review.id} review={review} />)
          ) : (
            <p className="text-white/40 text-sm text-center py-12">
              Cuando alguien valore tu perfil, aparecerá aquí con su foto y comentario.
            </p>
          )}

          {data?.nextCursor ? (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-2 text-xs text-white/50 hover:text-white border border-white/10 rounded-lg"
            >
              {loadingMore ? "Cargando..." : "Cargar más"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
