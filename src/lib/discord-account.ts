import type { Account } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isValidDiscordUserId } from "@/lib/lanyard";
import { getEnabledOAuthProviderIds } from "@/lib/oauth-providers";

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

function parseSettings(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
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

export function isDiscordOAuthAvailable(): boolean {
  return getEnabledOAuthProviderIds().includes("discord");
}

export async function getLinkedDiscordAccount(userId: string) {
  return prisma.account.findFirst({
    where: { userId, provider: "discord" },
    select: { id: true, providerAccountId: true },
  });
}

export async function syncDiscordUserIdToProfile(
  userId: string,
  discordUserId: string
): Promise<void> {
  if (!isValidDiscordUserId(discordUserId)) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { settings: true },
  });
  if (!user) return;

  const settings = parseSettings(user.settings);
  if (settings.discordUserId === discordUserId) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      settings: JSON.stringify({
        ...settings,
        discordUserId,
      }),
    },
  });
}

export async function clearDiscordUserIdFromProfile(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { settings: true },
  });
  if (!user) return;

  const settings = parseSettings(user.settings);
  if (!settings.discordUserId) return;

  const { discordUserId: _removed, ...rest } = settings;
  void _removed;

  await prisma.user.update({
    where: { id: userId },
    data: { settings: JSON.stringify(rest) },
  });
}

export async function ensureDiscordUserIdSynced(userId: string): Promise<string | null> {
  const linked = await getLinkedDiscordAccount(userId);
  if (!linked) return null;

  await syncDiscordUserIdToProfile(userId, linked.providerAccountId);
  return linked.providerAccountId;
}

export type LinkDiscordResult =
  | { ok: true; discordUserId: string }
  | { ok: false; error: "ALREADY_LINKED_OTHER" | "NOT_FOUND" };

export async function linkDiscordAccountForUser(
  userId: string,
  oauthAccount: OAuthAccountInput
): Promise<LinkDiscordResult> {
  if (oauthAccount.provider !== "discord") {
    return { ok: false, error: "NOT_FOUND" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) return { ok: false, error: "NOT_FOUND" };

  const existing = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "discord",
        providerAccountId: oauthAccount.providerAccountId,
      },
    },
  });

  if (existing && existing.userId !== userId) {
    return { ok: false, error: "ALREADY_LINKED_OTHER" };
  }

  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: accountData(oauthAccount),
    });
  } else {
    await prisma.account.create({
      data: {
        userId,
        ...accountData(oauthAccount),
      },
    });
  }

  await syncDiscordUserIdToProfile(userId, oauthAccount.providerAccountId);
  return { ok: true, discordUserId: oauthAccount.providerAccountId };
}

export type UnlinkDiscordResult =
  | { ok: true }
  | { ok: false; error: "NOT_LINKED" | "ONLY_LOGIN_METHOD" };

export async function unlinkDiscordAccount(userId: string): Promise<UnlinkDiscordResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      passwordHash: true,
      accounts: { select: { id: true, provider: true } },
    },
  });

  if (!user) return { ok: false, error: "NOT_LINKED" };

  const discordAccount = user.accounts.find((a) => a.provider === "discord");
  if (!discordAccount) return { ok: false, error: "NOT_LINKED" };

  const hasOtherLogin =
    Boolean(user.passwordHash) ||
    user.accounts.some((a) => a.provider !== "discord");

  if (!hasOtherLogin) {
    return { ok: false, error: "ONLY_LOGIN_METHOD" };
  }

  await prisma.$transaction([
    prisma.account.delete({ where: { id: discordAccount.id } }),
  ]);

  await clearDiscordUserIdFromProfile(userId);
  return { ok: true };
}
