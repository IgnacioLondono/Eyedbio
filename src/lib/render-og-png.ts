import sharp from "sharp";
import QRCode from "qrcode";
import { Profile } from "@/types/profile";
import { resolveOgAvatarSrc } from "@/lib/resolve-og-avatar";
import { isSocialLinkActive } from "@/lib/social-link-utils";
import { renderBackgroundLayer } from "@/lib/og/resolve-og-background";
import { buildPlatformIconSvg } from "@/lib/og/og-platform-icons";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length >= 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return { r: 24, g: 24, b: 32 };
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
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
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${accent}44" stroke="${accent}" stroke-width="3"/>`;
  }

  return `
    <defs>
      <clipPath id="${clipId}">
        <circle cx="${cx}" cy="${cy}" r="${r - 2}"/>
      </clipPath>
    </defs>
    <image href="${avatarDataUrl}" x="${x}" y="${y}" width="${size}" height="${size}" clip-path="url(#${clipId})"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${accent}" stroke-width="3"/>
  `;
}

function buildLinkIconsRow(
  profile: Profile,
  cardX: number,
  cardW: number,
  rowY: number,
  iconSize: number,
  maxIcons: number
): string {
  const accent = profile.settings.accentColor ?? "#a855f7";
  const links = profile.links.filter(isSocialLinkActive).slice(0, maxIcons);
  if (links.length === 0) return "";

  const gap = 10;
  const totalW = links.length * iconSize + (links.length - 1) * gap;
  let x = cardX + (cardW - totalW) / 2 + iconSize / 2;

  return links
    .map((link) => {
      const markup = buildPlatformIconSvg(link.platform, x, rowY, iconSize, accent);
      x += iconSize + gap;
      return markup;
    })
    .join("");
}

function buildOgCardSvg(
  profile: Profile,
  avatarDataUrl: string | null,
  cardW: number,
  cardH: number
): string {
  const { settings } = profile;
  const accent = settings.accentColor ?? "#a855f7";
  const textColor = settings.textColor ?? "#ffffff";
  const cardOpacity = Math.min(1, Math.max(0.35, settings.profileOpacity ?? 0.85));
  const cardFill = settings.transparentCard
    ? rgba(settings.cardColor ?? "#18181b", cardOpacity * 0.55)
    : rgba(settings.cardColor ?? "#18181b", cardOpacity);
  const border = settings.showCardBorder
    ? `stroke="${accent}" stroke-width="2" stroke-opacity="${settings.borderOpacity ?? 0.5}"`
    : `stroke="${accent}33" stroke-width="1"`;
  const shadow = settings.showCardShadow
    ? `<filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000000" flood-opacity="0.45"/>
      </filter>`
    : "";

  const bio =
    profile.bio.trim().slice(0, 120) ||
    `Todos los enlaces de @${profile.username}`;
  const bioLines = wrapBio(bio, 34, 2);
  const bioText = bioLines
    .map(
      (line, i) =>
        `<tspan x="${cardW / 2}" dy="${i === 0 ? 0 : 30}" text-anchor="middle">${escapeXml(line)}</tspan>`
    )
    .join("");

  const avatarSize = 96;
  const avatarCy = 72;
  const nameY = avatarCy + avatarSize / 2 + 36;
  const userY = nameY + 34;
  const bioY = userY + 38;
  const iconsY = bioY + (bioLines.length > 1 ? 72 : 44);
  const icons = buildLinkIconsRow(profile, 0, cardW, iconsY, 40, 8);

  const gradientDef = settings.gradientEnabled
    ? `<linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${settings.cardColor ?? "#18181b"}" stop-opacity="${cardOpacity}"/>
        <stop offset="100%" stop-color="${settings.cardColorSecondary ?? settings.cardColor ?? "#27272a"}" stop-opacity="${cardOpacity}"/>
      </linearGradient>`
    : "";

  const cardFillAttr = settings.gradientEnabled ? 'fill="url(#cardGrad)"' : `fill="${cardFill}"`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${cardW}" height="${cardH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${gradientDef}
    ${shadow}
  </defs>
  <rect width="${cardW}" height="${cardH}" rx="28" ${cardFillAttr} ${border} filter="${settings.showCardShadow ? "url(#cardShadow)" : "none"}"/>
  ${avatarMarkup(cardW / 2, avatarCy, avatarSize, accent, avatarDataUrl, "ogCardAvatar")}
  <text x="${cardW / 2}" y="${nameY}" text-anchor="middle" fill="${textColor}" font-family="system-ui,sans-serif" font-size="34" font-weight="700">${escapeXml(profile.displayName || profile.username)}</text>
  <text x="${cardW / 2}" y="${userY}" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="20" font-weight="600">@${escapeXml(profile.username)}</text>
  <text x="${cardW / 2}" y="${bioY}" text-anchor="middle" fill="${textColor}" opacity="0.82" font-family="system-ui,sans-serif" font-size="18">${bioText}</text>
  ${icons}
</svg>`;
}

function buildStoryCardSvg(
  profile: Profile,
  avatarDataUrl: string | null,
  cardW: number,
  cardH: number
): string {
  const { settings } = profile;
  const accent = settings.accentColor ?? "#a855f7";
  const textColor = settings.textColor ?? "#ffffff";
  const cardOpacity = Math.min(1, Math.max(0.35, settings.profileOpacity ?? 0.85));
  const cardFill = settings.transparentCard
    ? rgba(settings.cardColor ?? "#18181b", cardOpacity * 0.55)
    : rgba(settings.cardColor ?? "#18181b", cardOpacity);
  const border = settings.showCardBorder
    ? `stroke="${accent}" stroke-width="2" stroke-opacity="${settings.borderOpacity ?? 0.5}"`
    : `stroke="${accent}33" stroke-width="1"`;

  const bio =
    profile.bio.trim().slice(0, 100) || `Todos mis enlaces en un solo lugar`;
  const bioLines = wrapBio(bio, 30, 3);
  const bioText = bioLines
    .map(
      (line, i) =>
        `<tspan x="${cardW / 2}" dy="${i === 0 ? 0 : 32}" text-anchor="middle">${escapeXml(line)}</tspan>`
    )
    .join("");

  const avatarSize = 120;
  const avatarCy = 88;
  const nameY = avatarCy + avatarSize / 2 + 44;
  const userY = nameY + 38;
  const bioY = userY + 42;
  const iconsY = bioY + bioLines.length * 32 + 16;
  const icons = buildLinkIconsRow(profile, 0, cardW, iconsY, 44, 10);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${cardW}" height="${cardH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${cardW}" height="${cardH}" rx="32" fill="${cardFill}" ${border}/>
  ${avatarMarkup(cardW / 2, avatarCy, avatarSize, accent, avatarDataUrl, "storyCardAvatar")}
  <text x="${cardW / 2}" y="${nameY}" text-anchor="middle" fill="${textColor}" font-family="system-ui,sans-serif" font-size="42" font-weight="700">${escapeXml(profile.displayName || profile.username)}</text>
  <text x="${cardW / 2}" y="${userY}" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="24" font-weight="600">@${escapeXml(profile.username)}</text>
  <text x="${cardW / 2}" y="${bioY}" text-anchor="middle" fill="${textColor}" opacity="0.82" font-family="system-ui,sans-serif" font-size="22">${bioText}</text>
  ${icons}
</svg>`;
}

function buildBrandingOverlay(
  width: number,
  height: number,
  username: string,
  accent: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <text x="40" y="48" fill="#ffffff" opacity="0.75" font-family="system-ui,sans-serif" font-size="22" font-weight="600">eyed.bio/${escapeXml(username)}</text>
  <text x="${width - 40}" y="${height - 36}" text-anchor="end" fill="${accent}" font-family="system-ui,sans-serif" font-size="20" font-weight="700" letter-spacing="2">EYED.BIO</text>
</svg>`;
}

async function compositeShareImage(
  profile: Profile,
  siteUrl: string,
  width: number,
  height: number,
  cardW: number,
  cardH: number,
  buildCard: (avatar: string | null) => string
): Promise<Buffer> {
  const accent = profile.settings.accentColor ?? "#a855f7";
  const avatarDataUrl = await resolveOgAvatarSrc(profile.avatarUrl, siteUrl);
  const background = await renderBackgroundLayer(profile, siteUrl, width, height);
  const cardSvg = buildCard(avatarDataUrl);
  const cardPng = await sharp(Buffer.from(cardSvg)).png().toBuffer();
  const brandingSvg = buildBrandingOverlay(width, height, profile.username, accent);
  const brandingPng = await sharp(Buffer.from(brandingSvg)).png().toBuffer();

  const cardLeft = Math.round((width - cardW) / 2);
  const cardTop = Math.round((height - cardH) / 2);

  return sharp(background)
    .composite([
      { input: cardPng, top: cardTop, left: cardLeft },
      { input: brandingPng, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();
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
  const cardW = 460;
  const cardH = 500;

  return compositeShareImage(
    profile,
    siteUrl,
    1200,
    630,
    cardW,
    cardH,
    (avatar) => buildOgCardSvg(profile, avatar, cardW, cardH)
  );
}

export async function renderStoryPng(
  profile: Profile,
  siteUrl: string,
  profileUrl: string
): Promise<Buffer> {
  const accent = profile.settings.accentColor ?? "#a855f7";
  const cardW = 560;
  const cardH = 720;

  const base = await compositeShareImage(
    profile,
    siteUrl,
    1080,
    1920,
    cardW,
    cardH,
    (avatar) => buildStoryCardSvg(profile, avatar, cardW, cardH)
  );

  let qrMarkup = "";
  try {
    const qrDataUrl = await QRCode.toDataURL(profileUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#111111", light: "#ffffff" },
    });
    qrMarkup = `
      <rect x="440" y="1500" width="200" height="200" rx="20" fill="#ffffff"/>
      <image href="${qrDataUrl}" x="450" y="1510" width="180" height="180"/>
    `;
  } catch {
    qrMarkup = `
      <rect x="360" y="1500" width="360" height="80" rx="16" fill="#ffffff" opacity="0.9"/>
      <text x="540" y="1550" text-anchor="middle" fill="#111111" font-family="system-ui,sans-serif" font-size="18">${escapeXml(profileUrl)}</text>
    `;
  }

  const footerSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
  ${qrMarkup}
  <text x="540" y="1750" text-anchor="middle" fill="#ffffff" opacity="0.8" font-family="system-ui,sans-serif" font-size="24">Escanea o visita</text>
  <text x="540" y="1800" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="28" font-weight="700" letter-spacing="3">EYED.BIO</text>
</svg>`;

  const footerPng = await sharp(Buffer.from(footerSvg)).png().toBuffer();

  return sharp(base)
    .composite([{ input: footerPng, top: 0, left: 0 }])
    .png()
    .toBuffer();
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
