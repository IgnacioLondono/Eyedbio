import type { Account, User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isUserBlocked } from "@/lib/auth/auth-user";
import { issueNextPublicUid } from "@/lib/public-uid";
import { normalizeEmail, normalizeUsername } from "@/lib/validation";
import { DEFAULT_SETTINGS } from "@/types/profile";
import { localeFromLanguageTag } from "@/lib/i18n/types";

type OAuthAccountInput = Pick<
  Account,
  | "type"
  | "provider"
  | "providerAccountId"
  | "refresh_token"
  | "access_token"
  | "expires_at"
  | "token_type"
  | "scope"
  | "id_token"
  | "session_state"
>;

type OAuthProfileInput = {
  email: string;
  name?: string | null;
  image?: string | null;
  locale?: string | null;
};

async function generateUniqueUsername(seed: string): Promise<string> {
  const baseRaw = normalizeUsername(seed);
  const base = baseRaw.length >= 3 ? baseRaw.slice(0, 20) : "user";

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const suffix =
      attempt === 0 ? "" : String(Math.floor(1000 + Math.random() * 8999));
    const candidate = `${base}${suffix}`.slice(0, 32);
    const taken = await prisma.user.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
  }

  return `user${Date.now().toString(36).slice(-8)}`;
}

function accountData(input: OAuthAccountInput) {
  return {
    type: input.type,
    provider: input.provider,
    providerAccountId: input.providerAccountId,
    refresh_token: input.refresh_token,
    access_token: input.access_token,
    expires_at: input.expires_at,
    token_type: input.token_type,
    scope: input.scope,
    id_token: input.id_token,
    session_state: input.session_state,
  };
}

export async function resolveOAuthSignIn(
  profile: OAuthProfileInput,
  oauthAccount: OAuthAccountInput
): Promise<User | null> {
  const email = normalizeEmail(profile.email);
  if (!email) return null;

  const linked = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: oauthAccount.provider,
        providerAccountId: oauthAccount.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (linked) {
    if (isUserBlocked(linked.user)) return null;

    await prisma.account.update({
      where: { id: linked.id },
      data: accountData(oauthAccount),
    });

    return linked.user;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    if (isUserBlocked(existingUser)) return null;

    await prisma.account.create({
      data: {
        userId: existingUser.id,
        ...accountData(oauthAccount),
      },
    });

    if (!existingUser.avatarUrl && profile.image?.trim()) {
      return prisma.user.update({
        where: { id: existingUser.id },
        data: { avatarUrl: profile.image.trim() },
      });
    }

    return existingUser;
  }

  const emailLocal = email.split("@")[0] ?? "user";
  const username = await generateUniqueUsername(profile.name ?? emailLocal);
  const displayName = profile.name?.trim() || username;
  const locale = localeFromLanguageTag(profile.locale ?? undefined);
  const avatarUrl = profile.image?.trim() || null;

  return prisma.$transaction(async (tx) => {
    const publicUid = await issueNextPublicUid(tx);

    const user = await tx.user.create({
      data: {
        email,
        username,
        displayName,
        locale,
        publicUid,
        avatarUrl,
        settings: JSON.stringify(DEFAULT_SETTINGS),
        accounts: {
          create: accountData(oauthAccount),
        },
      },
    });

    return user;
  });
}

export async function findUserByEmailForOAuth(email: string): Promise<User | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user || isUserBlocked(user)) return null;
  return user;
}
