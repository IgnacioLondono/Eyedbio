import type { Metadata } from "next";
import MarketplacePageClient from "@/components/marketplace/MarketplacePageClient";

export const metadata: Metadata = {
  title: "Marketplace de plantillas — Eyed.bio",
  description:
    "Explora y aplica plantillas de estilo para tu perfil Eyed.bio. Sube la tuya y compártela con la comunidad.",
};

export default function MarketplacePage() {
  return <MarketplacePageClient />;
}
