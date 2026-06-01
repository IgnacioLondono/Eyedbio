export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function normalizeUsername(username: string): string {
  return username
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

export function validateEmail(email: string): string | null {
  if (!email) return "El email es obligatorio";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email inválido";
  return null;
}

export function validateUsername(username: string): string | null {
  if (!username) return "El usuario es obligatorio";
  if (!/^[a-z0-9]+$/.test(username)) {
    return "Solo letras y números, sin espacios ni símbolos";
  }
  if (username.length < 3) return "El usuario debe tener al menos 3 caracteres";
  if (username.length > 32) return "El usuario no puede superar 32 caracteres";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "La contraseña es obligatoria";
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  return null;
}

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
