import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  GUEST_VIEWER_COOKIE,
  guestViewerCookieOptions,
  resolveGuestViewer,
} from "@/lib/guest-viewer";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ username: string }>;
}

async function getProfileViews(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { views: true },
  });
  return user?.views ?? 0;
}

export async function POST(request: Request, { params }: Props) {
  const { username } = await params;
  const normalizedUsername = username.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    select: { id: true, views: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const session = await auth();
  const isOwner =
    session?.user?.id === existing.id ||
    session?.user?.username?.toLowerCase() === normalizedUsername;

  if (isOwner) {
    return NextResponse.json({ views: existing.views, skipped: true });
  }

  const viewerId = session?.user?.id;

  // Sesión JWT con userId borrado / de otra DB → no usar como viewer (evita P2003).
  const viewer =
    viewerId != null
      ? await prisma.user.findUnique({
          where: { id: viewerId },
          select: { id: true },
        })
      : null;

  if (viewer) {
    const created = await prisma.profileView.createMany({
      data: [{ viewerId: viewer.id, profileUserId: existing.id }],
      skipDuplicates: true,
    });

    if (created.count === 0) {
      return NextResponse.json({
        views: await getProfileViews(normalizedUsername),
        skipped: true,
      });
    }

    const user = await prisma.user.update({
      where: { username: normalizedUsername },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return NextResponse.json({ views: user.views, skipped: false });
  }

  const { guestId, shouldSetCookie } = resolveGuestViewer(
    request.headers.get("cookie")
  );

  const created = await prisma.profileViewGuest.createMany({
    data: [{ profileUserId: existing.id, guestId }],
    skipDuplicates: true,
  });

  if (created.count === 0) {
    const response = NextResponse.json({
      views: await getProfileViews(normalizedUsername),
      skipped: true,
    });
    if (shouldSetCookie) {
      response.cookies.set(GUEST_VIEWER_COOKIE, guestId, guestViewerCookieOptions());
    }
    return response;
  }

  const user = await prisma.user.update({
    where: { username: normalizedUsername },
    data: { views: { increment: 1 } },
    select: { views: true },
  });

  const response = NextResponse.json({ views: user.views, skipped: false });
  if (shouldSetCookie) {
    response.cookies.set(GUEST_VIEWER_COOKIE, guestId, guestViewerCookieOptions());
  }
  return response;
}
