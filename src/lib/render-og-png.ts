import sharp from "sharp";
import QRCode from "qrcode";
import { Profile } from "@/types/profile";
import { resolveOgAvatarSrc } from "@/lib/resolve-og-avatar";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapBio(text: string, maxCharsPerLine = 42, maxLines = 2): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length >= maxLines - 1) break;
  }

  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.length > 0) {
    const last = lines[maxLines - 1];
    if (last.length > maxCharsPerLine - 3) {
      lines[maxLines - 1] = `${last.slice(0, maxCharsPerLine - 3).trim()}...`;
    }
  }

  return lines.length > 0 ? lines : [text.slice(0, maxCharsPerLine)];
}

async function svgToPng(svg: string, width: number, height: number): Promise<Buffer> {
  return sharp(Buffer.from(svg)).resize(width, height).png().toBuffer();
}

function avatarMarkup(
  cx: number,
  cy: number,
  size: number,
  accent: string,
  avatarDataUrl: string | null,
  clipId: string
): string {
  const r = size / 2;
  const x = cx - r;
  const y = cy - r;

  if (!avatarDataUrl) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${accent}33" stroke="${accent}" stroke-width="4"/>`;
  }

  return `
    <defs>
      <clipPath id="${clipId}">
        <circle cx="${cx}" cy="${cy}" r="${r - 2}"/>
      </clipPath>
    </defs>
    <image href="${avatarDataUrl}" x="${x}" y="${y}" width="${size}" height="${size}" clip-path="url(#${clipId})"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${accent}" stroke-width="4"/>
  `;
}

export async function renderFallbackOgPng(): Promise<Buffer> {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#1a1033"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="330" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="56" font-weight="700">Eyed.bio</text>
</svg>`;

  return svgToPng(svg, 1200, 630);
}

export async function renderProfileOgPng(
  profile: Profile,
  siteUrl: string
): Promise<Buffer> {
  const accent = profile.settings.accentColor ?? "#a855f7";
  const avatarDataUrl = await resolveOgAvatarSrc(profile.avatarUrl, siteUrl);
  const bio =
    profile.bio.trim().slice(0, 120) ||
    `Todos los enlaces de @${profile.username}`;
  const bioLines = wrapBio(bio);
  const bioText = bioLines
    .map(
      (line, i) =>
        `<tspan x="72" dy="${i === 0 ? 0 : 36}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="45%" stop-color="#12081f"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.25"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="72" y="110" fill="#8b8b99" font-family="system-ui,sans-serif" font-size="28">eyed.bio/${escapeXml(profile.username)}</text>
  <text x="72" y="190" fill="#ffffff" font-family="system-ui,sans-serif" font-size="56" font-weight="700">${escapeXml(profile.displayName)}</text>
  <text x="72" y="250" fill="#b4b4be" font-family="system-ui,sans-serif" font-size="28">${bioText}</text>
  ${avatarMarkup(980, 315, 220, accent, avatarDataUrl, "ogAvatar")}
  <text x="980" y="470" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="22" font-weight="600">Eyed.bio</text>
</svg>`;

  return svgToPng(svg, 1200, 630);
}

export async function renderStoryPng(
  profile: Profile,
  siteUrl: string,
  profileUrl: string
): Promise<Buffer> {
  const accent = profile.settings.accentColor ?? "#a855f7";
  const avatarDataUrl = await resolveOgAvatarSrc(profile.avatarUrl, siteUrl);
  const bio =
    profile.bio.trim().slice(0, 100) || `Todos mis enlaces en un solo lugar`;
  const bioLines = wrapBio(bio, 36, 3);
  const bioText = bioLines
    .map(
      (line, i) =>
        `<tspan x="540" dy="${i === 0 ? 0 : 34}" text-anchor="middle">${escapeXml(line)}</tspan>`
    )
    .join("");

  let qrMarkup = "";
  try {
    const qrDataUrl = await QRCode.toDataURL(profileUrl, {
      width: 240,
      margin: 1,
      color: { dark: "#111111", light: "#ffffff" },
    });
    qrMarkup = `
      <rect x="420" y="1380" width="280" height="280" rx="24" fill="#ffffff"/>
      <image href="${qrDataUrl}" x="440" y="1400" width="240" height="240"/>
    `;
  } catch {
    qrMarkup = `
      <rect x="420" y="1380" width="280" height="280" rx="24" fill="#ffffff"/>
      <text x="560" y="1520" text-anchor="middle" fill="#111111" font-family="system-ui,sans-serif" font-size="18">${escapeXml(profileUrl)}</text>
    `;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="35%" stop-color="#12081f"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.28"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  ${avatarMarkup(540, 420, 280, accent, avatarDataUrl, "storyAvatar")}
  <text x="540" y="620" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="64" font-weight="700">${escapeXml(profile.displayName)}</text>
  <text x="540" y="680" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="32" font-weight="600">@${escapeXml(profile.username)}</text>
  <text x="540" y="760" text-anchor="middle" fill="#b4b4be" font-family="system-ui,sans-serif" font-size="28">${bioText}</text>
  ${qrMarkup}
  <text x="540" y="1710" text-anchor="middle" fill="#8b8b99" font-family="system-ui,sans-serif" font-size="26">Escanea o visita</text>
  <text x="540" y="1760" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="34" font-weight="600">eyed.bio/${escapeXml(profile.username)}</text>
  <text x="540" y="1820" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="24" font-weight="700" letter-spacing="4">EYED.BIO</text>
</svg>`;

  return svgToPng(svg, 1080, 1920);
}

export async function renderFallbackStoryPng(): Promise<Buffer> {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#1a1033"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <text x="540" y="980" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="56" font-weight="700">Eyed.bio</text>
</svg>`;

  return svgToPng(svg, 1080, 1920);
}

function pngResponse(buffer: Buffer, cacheSeconds = 3600): Response {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": `public, max-age=${cacheSeconds}, stale-while-revalidate=86400`,
    },
  });
}

export { pngResponse };
