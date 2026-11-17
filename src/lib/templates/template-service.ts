import { prisma } from "@/lib/prisma";
import { OFFICIAL_TEMPLATE_SEEDS } from "@/lib/templates/official-presets";
import {
  applyTemplateSettings,
  parseTemplateSettingsJson,
  snapshotTemplateSettings,
  withUniqueSlug,
} from "@/lib/templates/template-settings";
import { userToProfile } from "@/lib/profile/profile-mapper";
import { saveUserProfile } from "@/lib/profile/profile-save";
import type { ProfileSettings } from "@/types/profile";
import { resolveCardLayout } from "@/lib/config/card-layout-config";

export type TemplatePublic = {
  id: string;
  slug: string;
  title: string;
  description: string;
  previewUrl: string | null;
  authorId: string | null;
  layout: string;
  category: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  official: boolean;
  priceCents: number;
  currency: string | null;
  isPaid: boolean;
  installs: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  author: { username: string; displayName: string; avatarUrl: string | null } | null;
  settings: Partial<ProfileSettings>;
};

function parseTags(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((t) => typeof t === "string").slice(0, 12) : [];
  } catch {
    return [];
  }
}

type TemplateRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  previewUrl: string | null;
  authorId: string | null;
  layout: string;
  category: string;
  tags: string;
  published: boolean;
  featured: boolean;
  official: boolean;
  priceCents: number;
  currency: string | null;
  isPaid: boolean;
  installs: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  settingsJson: string;
  author?: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
};

export function toTemplatePublic(row: TemplateRow): TemplatePublic {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    previewUrl: row.previewUrl,
    authorId: row.authorId,
    layout: row.layout,
    category: row.category,
    tags: parseTags(row.tags),
    published: row.published,
    featured: row.featured,
    official: row.official,
    priceCents: row.priceCents,
    currency: row.currency,
    isPaid: row.isPaid,
    installs: row.installs,
    likes: row.likes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    author: row.author
      ? {
          username: row.author.username,
          displayName: row.author.displayName,
          avatarUrl: row.author.avatarUrl,
        }
      : null,
    settings: parseTemplateSettingsJson(row.settingsJson),
  };
}

export async function ensureOfficialTemplates(): Promise<void> {
  for (const seed of OFFICIAL_TEMPLATE_SEEDS) {
    const settingsJson = JSON.stringify(seed.settings);
    await prisma.profileTemplate.upsert({
      where: { slug: seed.slug },
      create: {
        slug: seed.slug,
        title: seed.title,
        description: seed.description,
        settingsJson,
        layout: resolveCardLayout(seed.settings),
        category: seed.category,
        tags: JSON.stringify(seed.tags),
        published: true,
        featured: Boolean(seed.featured),
        official: true,
        priceCents: 0,
        isPaid: false,
        authorId: null,
      },
      update: {
        title: seed.title,
        description: seed.description,
        settingsJson,
        layout: resolveCardLayout(seed.settings),
        category: seed.category,
        tags: JSON.stringify(seed.tags),
        published: true,
        featured: Boolean(seed.featured),
        official: true,
        priceCents: 0,
        isPaid: false,
      },
    });
  }
}

export async function listPublishedTemplates(options?: {
  category?: string;
  q?: string;
  mineUserId?: string;
  includeUnpublishedMine?: boolean;
}) {
  await ensureOfficialTemplates().catch((err) => {
    console.error("[templates] ensureOfficialTemplates", err);
  });

  const category = options?.category?.trim();
  const q = options?.q?.trim().toLowerCase();

  const rows = await prisma.profileTemplate.findMany({
    where: {
      OR: [
        { published: true },
        ...(options?.includeUnpublishedMine && options.mineUserId
          ? [{ authorId: options.mineUserId }]
          : []),
      ],
      ...(category && category !== "all" ? { category } : {}),
    },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
    },
    orderBy: [{ featured: "desc" }, { installs: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  let list = rows.map(toTemplatePublic);
  if (q) {
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.slug.includes(q)
    );
  }
  return list;
}

export async function getTemplateByIdOrSlug(idOrSlug: string) {
  const row = await prisma.profileTemplate.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
    },
  });
  return row ? toTemplatePublic(row) : null;
}

export async function createUserTemplate(input: {
  userId: string;
  title: string;
  description?: string;
  settings: Partial<ProfileSettings>;
  previewUrl?: string | null;
  category?: string;
  tags?: string[];
  publish?: boolean;
}) {
  const title = input.title.trim().slice(0, 80);
  if (title.length < 2) throw new Error("TITLE_REQUIRED");

  const snap = snapshotTemplateSettings(input.settings);
  const layout = resolveCardLayout(snap);
  let slug = withUniqueSlug(title, Math.random().toString(36).slice(2, 7));

  for (let i = 0; i < 5; i++) {
    const exists = await prisma.profileTemplate.findUnique({ where: { slug } });
    if (!exists) break;
    slug = withUniqueSlug(title, Math.random().toString(36).slice(2, 8));
  }

  const row = await prisma.profileTemplate.create({
    data: {
      slug,
      title,
      description: (input.description ?? "").trim().slice(0, 280),
      previewUrl: input.previewUrl ?? null,
      authorId: input.userId,
      settingsJson: JSON.stringify(snap),
      layout,
      category: (input.category ?? "community").trim().slice(0, 40) || "community",
      tags: JSON.stringify((input.tags ?? []).slice(0, 12)),
      published: Boolean(input.publish),
      featured: false,
      official: false,
      priceCents: 0,
      isPaid: false,
    },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
    },
  });

  return toTemplatePublic(row);
}

export async function publishTemplate(templateId: string, userId: string, published: boolean) {
  const existing = await prisma.profileTemplate.findUnique({ where: { id: templateId } });
  if (!existing) return null;
  if (existing.official) throw new Error("OFFICIAL_LOCKED");
  if (existing.authorId !== userId) throw new Error("FORBIDDEN");

  const row = await prisma.profileTemplate.update({
    where: { id: templateId },
    data: { published },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
    },
  });
  return toTemplatePublic(row);
}

export async function applyTemplateToUser(userId: string, templateId: string) {
  const template = await prisma.profileTemplate.findFirst({
    where: {
      id: templateId,
      OR: [{ published: true }, { authorId: userId }],
    },
  });
  if (!template) return { ok: false as const, error: "Plantilla no encontrada" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { links: { where: { archived: false }, orderBy: { sortOrder: "asc" } } },
  });
  if (!user) return { ok: false as const, error: "Usuario no encontrado" };

  const profile = userToProfile(user);
  const pack = parseTemplateSettingsJson(template.settingsJson);
  profile.settings = applyTemplateSettings(profile.settings, pack);

  const saved = await saveUserProfile(userId, profile, profile.updatedAt);
  if (!saved.ok) {
    if (saved.conflict) return { ok: false as const, error: "Conflicto al guardar; reintenta" };
    return { ok: false as const, error: saved.error };
  }

  await prisma.$transaction([
    prisma.profileTemplate.update({
      where: { id: template.id },
      data: { installs: { increment: 1 } },
    }),
    prisma.templateInstall.upsert({
      where: { userId_templateId: { userId, templateId: template.id } },
      create: { userId, templateId: template.id },
      update: { installedAt: new Date() },
    }),
  ]);

  return { ok: true as const, profile: saved.profile };
}
