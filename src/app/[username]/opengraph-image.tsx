import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/get-public-profile";
import { resolveOgAvatarSrc } from "@/lib/resolve-og-avatar";
import { getSiteUrlFromHeaders } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Vista previa del perfil Eyed.bio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ username: string }>;
}

function fallbackImage(label = "Eyed.bio") {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1033 100%)",
          color: "white",
          fontSize: 48,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {label}
      </div>
    ),
    { ...size }
  );
}

export default async function ProfileOgImage({ params }: Props) {
  try {
    const { username } = await params;
    const siteUrl = await getSiteUrlFromHeaders();
    const profile = await getPublicProfile(username);

    if (!profile) {
      return fallbackImage();
    }

    const avatarUrl = await resolveOgAvatarSrc(profile.avatarUrl, siteUrl);
    const accent = profile.settings.accentColor ?? "#a855f7";
    const bio =
      profile.bio.trim().slice(0, 120) ||
      `Todos los enlaces de @${profile.username}`;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "64px 72px",
            background: `linear-gradient(135deg, #0a0a0f 0%, #12081f 45%, ${accent}33 100%)`,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              paddingRight: 48,
            }}
          >
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 12,
              }}
            >
              eyed.bio/{profile.username}
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "white",
                lineHeight: 1.15,
                marginBottom: 16,
              }}
            >
              {profile.displayName}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.4,
              }}
            >
              {bio}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires img
              <img
                src={avatarUrl}
                alt=""
                width={220}
                height={220}
                style={{
                  borderRadius: "9999px",
                  border: `4px solid ${accent}`,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: "9999px",
                  background: `${accent}44`,
                  border: `4px solid ${accent}`,
                }}
              />
            )}
            <div
              style={{
                fontSize: 22,
                color: accent,
                fontWeight: 600,
              }}
            >
              Eyed.bio
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  } catch {
    return fallbackImage();
  }
}
