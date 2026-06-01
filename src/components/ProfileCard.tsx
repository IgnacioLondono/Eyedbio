"use client";

import { Profile } from "@/types/profile";
import { resolveCardLayout } from "@/lib/card-layout-config";
import {
  CARD_LAYOUT_COMPONENTS,
  ProfileCardMotionWrapper,
} from "@/components/profile-card/ProfileCardLayouts";

interface Props {
  profile: Profile;
  compact?: boolean;
}

const LAYOUT_MAX_WIDTH: Partial<Record<string, string>> = {
  glass: "max-w-[300px]",
  stack: "max-w-[280px]",
  split: "max-w-[280px]",
  banner: "max-w-[270px]",
};

export default function ProfileCard({ profile, compact = false }: Props) {
  const layout = resolveCardLayout(profile.settings);
  const Layout = CARD_LAYOUT_COMPONENTS[layout];
  const maxWidth = compact ? LAYOUT_MAX_WIDTH[layout] : undefined;

  return (
    <ProfileCardMotionWrapper profile={profile} compact={compact} maxWidth={maxWidth}>
      <Layout profile={profile} compact={compact} />
    </ProfileCardMotionWrapper>
  );
}
