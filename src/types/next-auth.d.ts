import { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: UserRole;
      blocked: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: UserRole;
    blocked: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: UserRole;
    blocked?: boolean;
  }
}
