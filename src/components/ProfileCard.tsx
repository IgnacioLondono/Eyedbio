"use client";

import { Profile } from "@/types/profile";
import { resolveCardLayout } from "@/lib/card-layout-config";
import {
  CARD_LAYOUT_COMPONENTS,
  ProfileCardMotionWrapper,
} from "@/components/profile-card/ProfileCardLayouts";
import ProfileCardControls from "@/components/profile-card/ProfileCardControls";
import { ProfileCardToolbarProvider } from "@/components/profile-card/ProfileCardToolbar";

interface Props {
  profile: Profile;
  compact?: boolean;
  /** Vista estática en landing (sin animación de entrada ni enlaces clicables). */
  showcase?: boolean;
  /** Controles de compartir y audio dentro de la tarjeta (solo perfil público). */
  showControls?: boolean;
}

/** Ancho máximo uniforme en vista previa para que el cambio de layout no “salte” horizontalmente. */
const COMPACT_CARD_MAX_WIDTH = "max-w-[280px]";

export default function ProfileCard({
  profile,
  compact = false,
  showcase = false,
  showControls = false,
}: Props) {
  const layout = resolveCardLayout(profile.settings);
  const Layout = CARD_LAYOUT_COMPONENTS[layout];
  const maxWidth =
    compact && !showcase
      ? COMPACT_CARD_MAX_WIDTH
      : showcase
        ? COMPACT_CARD_MAX_WIDTH
        : undefined;
  const embedControls = showControls && !compact && !showcase;

  const layoutNode = <Layout profile={profile} compact={compact || showcase} />;

  return (
    <ProfileCardMotionWrapper
      profile={profile}
      compact={compact}
      showcase={showcase}
      maxWidth={maxWidth}
    >
      {embedControls ? (
        <ProfileCardToolbarProvider
          toolbar={
            <ProfileCardControls
              username={profile.username}
              displayName={profile.displayName}
              audioUrl={profile.audioUrl}
              audioStartTime={profile.audioStartTime}
              audioEnabled={profile.audioEnabled}
              accentColor={profile.settings.accentColor}
            />
          }
        >
          {layoutNode}
        </ProfileCardToolbarProvider>
      ) : (
        layoutNode
      )}
    </ProfileCardMotionWrapper>
  );
}
