import { findProfileByUsername } from "@/lib/profile/profile-query";
import { userToProfile } from "@/lib/profile/profile-mapper";
import { Profile } from "@/types/profile";

/** Perfil público leyendo siempre de BD (sin caché negativa). */
export async function getPublicProfile(username: string): Promise<Profile | null> {
  try {
    const user = await findProfileByUsername(username);
    if (!user) return null;
    return userToProfile(user);
  } catch (err) {
    console.error("[getPublicProfile]", username, err);
    throw err;
  }
}
