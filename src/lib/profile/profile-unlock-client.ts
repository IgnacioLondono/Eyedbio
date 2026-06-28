export const PROFILE_UNLOCK_STORAGE_PREFIX = "eyed_unlock_";
export const PROFILE_UNLOCK_HEADER = "X-Eyed-Profile-Unlock";

export function profileUnlockStorageKey(username: string): string {
  return `${PROFILE_UNLOCK_STORAGE_PREFIX}${username.toLowerCase()}`;
}

export function getStoredProfileUnlockToken(username: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(profileUnlockStorageKey(username));
  } catch {
    return null;
  }
}

export function storeProfileUnlockToken(username: string, token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(profileUnlockStorageKey(username), token);
  } catch {
    /* ignore quota / private mode */
  }
}

export function profileUnlockRequestHeaders(username: string): HeadersInit {
  const token = getStoredProfileUnlockToken(username);
  if (!token) return {};
  return { [PROFILE_UNLOCK_HEADER]: token };
}
