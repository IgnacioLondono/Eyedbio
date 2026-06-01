import { getCachedProfileUser } from "@/lib/cached-profile";
import { userToProfile } from "@/lib/profile-mapper";
import { Profile } from "@/types/profile";

export async function getPublicProfile(username: string): Promise<Profile | null> {
  try {
    const user = await getCachedProfileUser(username);
    if (!user) return null;
    return userToProfile(user);
  } catch {
    return null;
  }
}
