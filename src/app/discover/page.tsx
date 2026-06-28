import type { Metadata } from "next";
import DiscoverPageClient from "@/components/discover/DiscoverPageClient";

export const metadata: Metadata = {
  title: "Descubre perfiles — Eyed.bio",
  description:
    "Explora la comunidad Eyed.bio: perfiles más visitados, recientes y todos los perfiles públicos.",
};

export default function DiscoverPage() {
  return <DiscoverPageClient />;
}
