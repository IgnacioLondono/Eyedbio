/** Días entre cambios de nombre de usuario público. */
export const USERNAME_CHANGE_COOLDOWN_DAYS = 14;

export function getUsernameChangeStatus(usernameChangedAt: Date | null | undefined): {
  canChange: boolean;
  nextChangeAt: Date | null;
} {
  if (!usernameChangedAt) {
    return { canChange: true, nextChangeAt: null };
  }

  const nextChangeAt = new Date(usernameChangedAt);
  nextChangeAt.setDate(nextChangeAt.getDate() + USERNAME_CHANGE_COOLDOWN_DAYS);

  if (Date.now() >= nextChangeAt.getTime()) {
    return { canChange: true, nextChangeAt: null };
  }

  return { canChange: false, nextChangeAt };
}
