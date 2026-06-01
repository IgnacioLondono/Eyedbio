import { getCachedProfileUser } from "@/lib/cached-profile";
import { findProfileByUsername } from "@/lib/profile-query";
import { userToProfile } from "@/lib/profile-mapper";
import { Profile } from "@/types/profile";

export async function getPublicProfile(username: string): Promise<Profile | null> {
  try {
    let user = await getCachedProfileUser(username);
    if (!user) {
      user = await findProfileByUsername(username);
    }
    if (!user) return null;
    return userToProfile(user);
  } catch (err) {
    console.error("[getPublicProfile]", username, err);
    return null;
  }
}
