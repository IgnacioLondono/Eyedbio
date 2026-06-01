export const USER_ROLE_USER = "user";
export const USER_ROLE_ADMIN = "admin";

export type UserRole = typeof USER_ROLE_USER | typeof USER_ROLE_ADMIN;

export function isAdminRole(role: string | undefined | null): boolean {
  return role === USER_ROLE_ADMIN;
}
