import type { NextAuthConfig } from "next-auth";
import { isAdminRole } from "@/lib/roles";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.blocked = user.blocked;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = (token.role as typeof session.user.role) ?? "user";
        session.user.blocked = Boolean(token.blocked);
      }
      return session;
    },
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;

      if (path.startsWith("/admin")) {
        return Boolean(auth?.user && isAdminRole(auth.user.role) && !auth.user.blocked);
      }

      if (path.startsWith("/dashboard")) {
        if (!auth?.user) return false;
        if (auth.user.blocked) {
          return Response.redirect(new URL("/login?error=blocked", request.url));
        }
        return true;
      }

      return true;
    },
  },
};
