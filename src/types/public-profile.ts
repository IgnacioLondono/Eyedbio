import { Profile } from "@/types/profile";

export interface LockedPublicProfile {
  locked: true;
  accessCodeRequired: true;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export type PublicProfileResponse = Profile | LockedPublicProfile;

export function isLockedPublicProfile(
  data: PublicProfileResponse
): data is LockedPublicProfile {
  return "locked" in data && data.locked === true;
}
