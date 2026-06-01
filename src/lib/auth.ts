import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { isUserBlocked, toAuthUser } from "@/lib/auth-user";
import { isValidVerificationCode, normalizeVerificationCode } from "@/lib/password-reset";
import { normalizeEmail } from "@/lib/validation";

type AuthIntent = "login" | "signup" | "refresh";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Code", type: "text" },
        intent: { label: "Intent", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = normalizeEmail(String(credentials.email));
        const intent = String(credentials.intent ?? "login") as AuthIntent;
        const password = credentials.password ? String(credentials.password) : "";
        const code = credentials.code
          ? normalizeVerificationCode(String(credentials.code))
          : "";

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        if (isUserBlocked(user)) return null;

        const loadUser = async () => {
          const fresh = await prisma.user.findUnique({ where: { id: user.id } });
          return fresh && !isUserBlocked(fresh) ? fresh : null;
        };

        if (intent === "signup" || intent === "refresh") {
          if (!password) return null;
          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          const fresh = await loadUser();
          return fresh ? toAuthUser(fresh) : null;
        }

        if (!code || !isValidVerificationCode(code)) return null;

        try {
          const loginToken = await prisma.loginVerificationToken.findFirst({
            where: {
              userId: user.id,
              token: code,
              expiresAt: { gt: new Date() },
            },
          });

          if (!loginToken) return null;

          await prisma.loginVerificationToken.delete({ where: { id: loginToken.id } });
        } catch (err) {
          console.error("[auth] login verification lookup failed:", err);
          return null;
        }

        const fresh = await loadUser();
        return fresh ? toAuthUser(fresh) : null;
      },
    }),
  ],
});
