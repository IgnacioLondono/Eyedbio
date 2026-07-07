"use client";

import { Profile } from "@/types/profile";
import { resolveCardLayout, getCardMaxWidthClass } from "@/lib/config/card-layout-config";
import { resolveProfileDisplay } from "@/lib/profile/profile-display-config";
import { getEffectiveAudioUrl, getEffectiveAudioClipDuration, isBackgroundProfileAudio } from "@/lib/profile/profile-audio";
import { isMusicPlayerPlayable } from "@/lib/profile/music-player-config";
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
  /** Media activa tras la pantalla de entrada (evita autoplay antes del gesto). */
  mediaActive?: boolean;
}

/** Ancho máximo uniforme en vista previa para que el cambio de layout no “salte” horizontalmente. */

export default function ProfileCard({
  profile,
  compact = false,
  showcase = false,
  showControls = false,
  mediaActive = true,
}: Props) {
  const layout = resolveCardLayout(profile.settings);
  const display = resolveProfileDisplay(profile.settings);
  const Layout = CARD_LAYOUT_COMPONENTS[layout];
  const maxWidth =
    compact || showcase
      ? getCardMaxWidthClass(layout, true)
      : getCardMaxWidthClass(layout, false);
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
              playbackUrl={getEffectiveAudioUrl(profile)}
              audioStartTime={profile.audioStartTime}
              audioClipDuration={getEffectiveAudioClipDuration(profile)}
              volumeOnly={isBackgroundProfileAudio(profile)}
              audioEnabled={profile.audioEnabled}
              accentColor={profile.settings.accentColor}
              showShareButton={display.showShareButton}
              mediaActive={mediaActive}
              hideAudioControl={isMusicPlayerPlayable(profile)}
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
