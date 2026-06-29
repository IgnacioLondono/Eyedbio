import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Account as OAuthAccount } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth/auth.config";
import { isUserBlocked, toAuthUser } from "@/lib/auth/auth-user";
import { isValidVerificationCode, normalizeVerificationCode } from "@/lib/auth/password-reset";
import { normalizeEmail } from "@/lib/validation";
import { buildOAuthProviders } from "@/lib/auth/oauth-providers";
import { findUserByEmailForOAuth, findUserByOAuthAccount, resolveOAuthSignIn, signInWithLinkedOAuthAccount } from "@/lib/auth/oauth-user";
import {
  consumeDiscordLinkIntent,
  consumeDiscordLinkSessionRestore,
  setDiscordLinkSessionRestore,
} from "@/lib/auth/discord-link-intent";
import {
  linkDiscordAccountForUser,
  syncDiscordUserIdToProfile,
} from "@/lib/auth/discord-account";
import { getSiteSettings } from "@/lib/site-settings";

type AuthIntent = "login" | "signup" | "refresh";

function applyAuthUserToToken(
  token: Record<string, unknown>,
  user: { id: string; username: string; role: string; blockedAt: Date | null }
) {
  token.id = user.id;
  token.username = user.username;
  token.role = user.role === "admin" ? "admin" : "user";
  token.blocked = Boolean(user.blockedAt);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...buildOAuthProviders(),
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
          if (!password || !user.passwordHash) return null;
          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          const fresh = await loadUser();
          return fresh ? toAuthUser(fresh) : null;
        }

        if (intent === "login") {
          if (!user.loginCodeEnabled) {
            if (!password || !user.passwordHash) return null;
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
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (!account || account.provider === "credentials") return true;

      const oauthAccount = account as OAuthAccount;
      const linkUserId = await consumeDiscordLinkIntent();

      if (linkUserId && oauthAccount.provider === "discord") {
        const linked = await linkDiscordAccountForUser(linkUserId, {
          type: oauthAccount.type,
          provider: oauthAccount.provider,
          providerAccountId: oauthAccount.providerAccountId,
          refresh_token: oauthAccount.refresh_token ?? null,
          access_token: oauthAccount.access_token ?? null,
          expires_at: oauthAccount.expires_at ?? null,
          token_type: oauthAccount.token_type ?? null,
          scope: oauthAccount.scope ?? null,
          id_token: oauthAccount.id_token ?? null,
          session_state:
            typeof oauthAccount.session_state === "string"
              ? oauthAccount.session_state
              : null,
        });

        if (!linked.ok) return false;

        await setDiscordLinkSessionRestore(linkUserId);
        return true;
      }

      if (oauthAccount.provider === "discord") {
        const site = await getSiteSettings();
        if (!site.discordLoginEnabled) {
          return "/login?error=discord_login_disabled";
        }

        const dbUser = await signInWithLinkedOAuthAccount({
          type: oauthAccount.type,
          provider: oauthAccount.provider,
          providerAccountId: oauthAccount.providerAccountId,
          refresh_token: oauthAccount.refresh_token ?? null,
          access_token: oauthAccount.access_token ?? null,
          expires_at: oauthAccount.expires_at ?? null,
          token_type: oauthAccount.token_type ?? null,
          scope: oauthAccount.scope ?? null,
          id_token: oauthAccount.id_token ?? null,
          session_state:
            typeof oauthAccount.session_state === "string"
              ? oauthAccount.session_state
              : null,
        });

        if (!dbUser) return "/login?error=discord_not_linked";

        await syncDiscordUserIdToProfile(dbUser.id, oauthAccount.providerAccountId);
        return true;
      }

      const email = normalizeEmail(user.email ?? "");
      if (!email) return false;

      const dbUser = await resolveOAuthSignIn(
        {
          email,
          name: user.name,
          image: user.image,
          locale:
            typeof profile === "object" && profile && "locale" in profile
              ? String(profile.locale ?? "")
              : null,
        },
        {
          type: oauthAccount.type,
          provider: oauthAccount.provider,
          providerAccountId: oauthAccount.providerAccountId,
          refresh_token: oauthAccount.refresh_token ?? null,
          access_token: oauthAccount.access_token ?? null,
          expires_at: oauthAccount.expires_at ?? null,
          token_type: oauthAccount.token_type ?? null,
          scope: oauthAccount.scope ?? null,
          id_token: oauthAccount.id_token ?? null,
          session_state:
            typeof oauthAccount.session_state === "string"
              ? oauthAccount.session_state
              : null,
        }
      );

      return Boolean(dbUser);
    },
    async jwt({ token, user, account }) {
      // Solo durante el sign-in OAuth (Route Handler): restaurar sesión tras vincular Discord.
      // No tocar cookies en lecturas de sesión (RSC/middleware) — provoca JWTSessionError.
      if (user && account?.provider === "discord") {
        const restoreUserId = await consumeDiscordLinkSessionRestore();
        if (restoreUserId) {
          const dbUser = await prisma.user.findUnique({ where: { id: restoreUserId } });
          if (dbUser && !isUserBlocked(dbUser)) {
            applyAuthUserToToken(token, dbUser);
            return token;
          }
        }
      }

      if (user && account?.provider && account.provider !== "credentials") {
        const byAccount = await findUserByOAuthAccount(
          account.provider,
          account.providerAccountId
        );
        const dbUser =
          byAccount ??
          (await findUserByEmailForOAuth(user.email ?? String(token.email ?? "")));
        if (dbUser) applyAuthUserToToken(token, dbUser);
        return token;
      }

      if (user && "username" in user && user.id) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.blocked = user.blocked;
        return token;
      }

      return token;
    },
  },
});
