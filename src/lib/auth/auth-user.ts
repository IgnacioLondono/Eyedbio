import { User } from "@/generated/prisma/client";
import { UserRole, USER_ROLE_USER } from "@/lib/roles";

export function toAuthUser(user: User) {
  const role: UserRole = user.role === "admin" ? "admin" : USER_ROLE_USER;

  return {
    id: user.id,
    email: user.email,
    name: user.displayName,
    username: user.username,
    role,
    blocked: Boolean(user.blockedAt),
  };
}

export function isUserBlocked(user: Pick<User, "blockedAt">): boolean {
  return Boolean(user.blockedAt);
}
