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

const LAYOUT_MAX_WIDTH: Partial<Record<string, string>> = {
  glass: "max-w-[300px]",
  stack: "max-w-[280px]",
  split: "max-w-[280px]",
  banner: "max-w-[270px]",
};

export default function ProfileCard({
  profile,
  compact = false,
  showcase = false,
  showControls = false,
}: Props) {
  const layout = resolveCardLayout(profile.settings);
  const Layout = CARD_LAYOUT_COMPONENTS[layout];
  const maxWidth = compact && !showcase ? LAYOUT_MAX_WIDTH[layout] : showcase ? "max-w-[240px]" : undefined;
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
