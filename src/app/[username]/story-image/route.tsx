import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/get-public-profile";
import { absoluteMediaUrl, profilePublicUrl } from "@/lib/site-url";

export const runtime = "nodejs";

const size = { width: 1080, height: 1920 };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  const profileUrl = profilePublicUrl(username);

  if (!profile) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(180deg, #0a0a0f 0%, #1a1033 100%)",
            color: "white",
            fontSize: 56,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Eyed.bio
        </div>
      ),
      size
    );
  }

  const avatarUrl = absoluteMediaUrl(profile.avatarUrl);
  const accent = profile.settings.accentColor ?? "#a855f7";
  const bio =
    profile.bio.trim().slice(0, 100) || `Todos mis enlaces en un solo lugar`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=${encodeURIComponent(profileUrl)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "96px 72px 80px",
          background: `linear-gradient(180deg, #0a0a0f 0%, #12081f 35%, ${accent}44 100%)`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires img
            <img
              src={avatarUrl}
              alt=""
              width={280}
              height={280}
              style={{
                borderRadius: "9999px",
                border: `6px solid ${accent}`,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 280,
                height: 280,
                borderRadius: "9999px",
                background: `${accent}44`,
                border: `6px solid ${accent}`,
              }}
            />
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: "white",
                lineHeight: 1.1,
              }}
            >
              {profile.displayName}
            </div>
            <div
              style={{
                fontSize: 32,
                color: accent,
                fontWeight: 600,
              }}
            >
              @{profile.username}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.4,
                maxWidth: 800,
              }}
            >
              {bio}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              padding: 20,
              background: "white",
              borderRadius: 24,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires img */}
            <img src={qrUrl} alt="" width={240} height={240} />
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Escanea o visita
          </div>
          <div
            style={{
              fontSize: 34,
              color: "white",
              fontWeight: 600,
            }}
          >
            eyed.bio/{profile.username}
          </div>
          <div
            style={{
              fontSize: 24,
              color: accent,
              fontWeight: 700,
              letterSpacing: 2,
              marginTop: 8,
            }}
          >
            EYED.BIO
          </div>
        </div>
      </div>
    ),
    size
  );
}
