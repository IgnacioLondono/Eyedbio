import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/roles";

declare module "next-auth" {
  interface User {
    username?: string | null;
    role?: UserRole;
    blocked?: boolean;
  }

  interface Session {
    user: {
      id: string;
      username?: string | null;
      role?: UserRole;
      blocked?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string | null;
    role?: UserRole;
    blocked?: boolean;
  }
}
