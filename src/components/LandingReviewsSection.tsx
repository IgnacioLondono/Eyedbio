"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star } from "lucide-react";
import { ProfileReview } from "@/types/review";
import ReviewCard from "@/components/ReviewCard";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

export default function LandingReviewsSection() {
  const site = useSiteSettings();
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!site.profileReviewsEnabled) {
      setLoading(false);
      return;
    }
    fetch("/api/reviews/recent")
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [site.profileReviewsEnabled]);

  if (!site.profileReviewsEnabled) return null;

  if (!loading && reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-6 border-y border-white/5 bg-gradient-to-b from-purple-950/20 to-transparent">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            Comunidad
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Lo que dicen los <span className="text-amber-400">usuarios</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm">
            Valoraciones reales con estrellas y comentarios opcionales de la comunidad Eyed.bio.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <ReviewCard review={review} showProfile compact />
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-center text-white/35 text-xs mt-8">
          Gestiona las reseñas de tu perfil desde el{" "}
          <Link href="/dashboard" className="text-purple-400 hover:underline">
            dashboard
          </Link>
        </p>
      </div>
    </section>
  );
}
