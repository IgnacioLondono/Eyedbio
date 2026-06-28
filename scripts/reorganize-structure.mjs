/**
 * Reorganiza carpetas de src/components y src/lib, actualizando imports.
 * Uso: node scripts/reorganize-structure.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "src");

/** @type {Record<string, string>} oldPath relative to src -> newPath relative to src */
const MOVES = {
  // --- components ---
  "components/AuthLayout.tsx": "components/auth/AuthLayout.tsx",
  "components/OAuthButtons.tsx": "components/auth/OAuthButtons.tsx",
  "components/PasswordInput.tsx": "components/auth/PasswordInput.tsx",
  "components/Providers.tsx": "components/auth/Providers.tsx",
  "components/AccountSettings.tsx": "components/auth/AccountSettings.tsx",
  "components/DiscordAccountLink.tsx": "components/auth/DiscordAccountLink.tsx",
  "components/ProfileAccessGate.tsx": "components/auth/ProfileAccessGate.tsx",

  "components/DashboardReviewsButton.tsx": "components/dashboard/DashboardReviewsButton.tsx",

  "components/DiscoverPageClient.tsx": "components/discover/DiscoverPageClient.tsx",
  "components/ProfileDirectorySection.tsx": "components/discover/ProfileDirectorySection.tsx",

  "components/LinkEditor.tsx": "components/editor/LinkEditor.tsx",
  "components/CardLayoutPicker.tsx": "components/editor/CardLayoutPicker.tsx",
  "components/IconStylePicker.tsx": "components/editor/IconStylePicker.tsx",
  "components/AudioClipSelector.tsx": "components/editor/AudioClipSelector.tsx",

  "components/LandingPage.tsx": "components/landing/LandingPage.tsx",
  "components/LandingGunsShowcase.tsx": "components/landing/LandingGunsShowcase.tsx",
  "components/LandingReviewsSection.tsx": "components/landing/LandingReviewsSection.tsx",
  "components/LandingStyleShowcase.tsx": "components/landing/LandingStyleShowcase.tsx",
  "components/ClaimProfileCta.tsx": "components/landing/ClaimProfileCta.tsx",

  "components/Navbar.tsx": "components/layout/Navbar.tsx",
  "components/AppAreaNav.tsx": "components/layout/AppAreaNav.tsx",
  "components/Logo.tsx": "components/layout/Logo.tsx",
  "components/NavigationSync.tsx": "components/layout/NavigationSync.tsx",
  "components/CommunityDiscordLink.tsx": "components/layout/CommunityDiscordLink.tsx",

  "components/BackgroundEffects.tsx": "components/media/BackgroundEffects.tsx",
  "components/BackgroundEffectSelect.tsx": "components/media/BackgroundEffectSelect.tsx",
  "components/BackgroundMedia.tsx": "components/media/BackgroundMedia.tsx",
  "components/FocusedMedia.tsx": "components/media/FocusedMedia.tsx",
  "components/MediaGestureTracker.tsx": "components/media/MediaGestureTracker.tsx",
  "components/FileUpload.tsx": "components/media/FileUpload.tsx",
  "components/ImageAdjustModal.tsx": "components/media/ImageAdjustModal.tsx",

  "components/ProfileCard.tsx": "components/profile/ProfileCard.tsx",
  "components/ProfileView.tsx": "components/profile/ProfileView.tsx",
  "components/ProfilePageOverlay.tsx": "components/profile/ProfilePageOverlay.tsx",
  "components/ProfileEntryGate.tsx": "components/profile/ProfileEntryGate.tsx",
  "components/ProfileAudio.tsx": "components/profile/ProfileAudio.tsx",
  "components/ProfileTabIcon.tsx": "components/profile/ProfileTabIcon.tsx",
  "components/ProfileQuickNavButton.tsx": "components/profile/ProfileQuickNavButton.tsx",
  "components/AnimatedDisplayName.tsx": "components/profile/AnimatedDisplayName.tsx",
  "components/ShareProfileButton.tsx": "components/profile/ShareProfileButton.tsx",
  "components/SocialLinks.tsx": "components/profile/SocialLinks.tsx",
  "components/CustomLinkIcon.tsx": "components/profile/CustomLinkIcon.tsx",

  "components/LocaleProvider.tsx": "components/providers/LocaleProvider.tsx",
  "components/SiteSettingsProvider.tsx": "components/providers/SiteSettingsProvider.tsx",

  "components/ReviewCard.tsx": "components/reviews/ReviewCard.tsx",
  "components/ReviewsReceivedModal.tsx": "components/reviews/ReviewsReceivedModal.tsx",

  "components/PlatformIcons.tsx": "components/shared/PlatformIcons.tsx",
  "components/StarRating.tsx": "components/shared/StarRating.tsx",

  // --- hooks ---
  "lib/use-browser-pathname.ts": "hooks/use-browser-pathname.ts",

  // --- lib/auth ---
  "lib/auth.ts": "lib/auth/auth.ts",
  "lib/auth.config.ts": "lib/auth/auth.config.ts",
  "lib/auth-user.ts": "lib/auth/auth-user.ts",
  "lib/oauth-providers.ts": "lib/auth/oauth-providers.ts",
  "lib/oauth-user.ts": "lib/auth/oauth-user.ts",
  "lib/password-reset.ts": "lib/auth/password-reset.ts",
  "lib/admin-credentials.ts": "lib/auth/admin-credentials.ts",
  "lib/admin-guard.ts": "lib/auth/admin-guard.ts",
  "lib/ensure-admin.ts": "lib/auth/ensure-admin.ts",
  "lib/discord-link-intent.ts": "lib/auth/discord-link-intent.ts",
  "lib/discord-account.ts": "lib/auth/discord-account.ts",

  // --- lib/discord ---
  "lib/discord-presence.ts": "lib/discord/discord-presence.ts",
  "lib/eyedbot-link.ts": "lib/discord/eyedbot-link.ts",
  "lib/eyedbot-presence.ts": "lib/discord/eyedbot-presence.ts",
  "lib/lanyard.ts": "lib/discord/lanyard.ts",

  // --- lib/profile ---
  "lib/profile-access.ts": "lib/profile/profile-access.ts",
  "lib/profile-audio.ts": "lib/profile/profile-audio.ts",
  "lib/profile-audio-bridge.ts": "lib/profile/profile-audio-bridge.ts",
  "lib/profile-audio-engine.ts": "lib/profile/profile-audio-engine.ts",
  "lib/profile-background-video-audio.ts": "lib/profile/profile-background-video-audio.ts",
  "lib/profile-directory.ts": "lib/profile/profile-directory.ts",
  "lib/profile-display-config.ts": "lib/profile/profile-display-config.ts",
  "lib/profile-enter.ts": "lib/profile/profile-enter.ts",
  "lib/profile-mapper.ts": "lib/profile/profile-mapper.ts",
  "lib/profile-overlay-config.ts": "lib/profile/profile-overlay-config.ts",
  "lib/profile-query.ts": "lib/profile/profile-query.ts",
  "lib/profile-save.ts": "lib/profile/profile-save.ts",
  "lib/profile-tab-icon.ts": "lib/profile/profile-tab-icon.ts",
  "lib/profile-teardown.ts": "lib/profile/profile-teardown.ts",
  "lib/profile-unlock-client.ts": "lib/profile/profile-unlock-client.ts",
  "lib/get-public-profile.ts": "lib/profile/get-public-profile.ts",
  "lib/cached-profile.ts": "lib/profile/cached-profile.ts",
  "lib/demo-profiles.ts": "lib/profile/demo-profiles.ts",

  // --- lib/media ---
  "lib/media-config.ts": "lib/media/media-config.ts",
  "lib/media-focus.ts": "lib/media/media-focus.ts",
  "lib/media-gesture.ts": "lib/media/media-gesture.ts",
  "lib/media-storage.ts": "lib/media/media-storage.ts",
  "lib/media-url.ts": "lib/media/media-url.ts",
  "lib/image-moderation.ts": "lib/media/image-moderation.ts",
  "lib/upload.ts": "lib/media/upload.ts",

  // --- lib/config ---
  "lib/audio-config.ts": "lib/config/audio-config.ts",
  "lib/background-effects-config.ts": "lib/config/background-effects-config.ts",
  "lib/card-layout-config.ts": "lib/config/card-layout-config.ts",
  "lib/icon-style-config.ts": "lib/config/icon-style-config.ts",
  "lib/image-adjust-config.ts": "lib/config/image-adjust-config.ts",
  "lib/links-config.ts": "lib/config/links-config.ts",
  "lib/mail-config.ts": "lib/config/mail-config.ts",
  "lib/reviews-config.ts": "lib/config/reviews-config.ts",
  "lib/site-settings-config.ts": "lib/config/site-settings-config.ts",
  "lib/support-config.ts": "lib/config/support-config.ts",
  "lib/card-styles.ts": "lib/config/card-styles.ts",
  "lib/community.ts": "lib/config/community.ts",
  "lib/site-url.ts": "lib/config/site-url.ts",
  "lib/badges.ts": "lib/config/badges.ts",
  "lib/platforms.ts": "lib/config/platforms.ts",
  "lib/platform-categories.ts": "lib/config/platform-categories.ts",
  "lib/color-utils.ts": "lib/config/color-utils.ts",

  // --- lib/email ---
  "lib/mail.ts": "lib/email/mail.ts",
  "lib/verification-email-template.ts": "lib/email/verification-email-template.ts",
};

function toImportPath(relativePath) {
  const withoutExt = relativePath.replace(/\.tsx?$/, "");
  return `@/${withoutExt.replace(/\\/g, "/")}`;
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "generated") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(tsx?|mts)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

// Build replacement map: @/old -> @/new (longest old paths first)
const replacements = Object.entries(MOVES)
  .map(([from, to]) => ({
    from: toImportPath(from),
    to: toImportPath(to),
  }))
  .sort((a, b) => b.from.length - a.from.length);

console.log(`Moving ${replacements.length} files...`);

for (const [fromRel, toRel] of Object.entries(MOVES)) {
  const fromAbs = path.join(src, fromRel);
  const toAbs = path.join(src, toRel);
  if (!fs.existsSync(fromAbs)) {
    console.warn(`Skip (missing): ${fromRel}`);
    continue;
  }
  ensureDir(toAbs);
  fs.renameSync(fromAbs, toAbs);
  console.log(`  ${fromRel} -> ${toRel}`);
}

const files = walk(src);
let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let next = content;
  for (const { from, to } of replacements) {
    next = next.split(from).join(to);
  }
  if (next !== content) {
    fs.writeFileSync(file, next, "utf8");
    changedFiles++;
  }
}

console.log(`Updated imports in ${changedFiles} files.`);

// Corregir doble prefijo cuando un módulo ya estaba bajo la carpeta destino (p. ej. lib/auth/auth.ts)
const doubleFixes = [
  ["@/lib/auth/auth/", "@/lib/auth/"],
  ["@/lib/profile/profile/", "@/lib/profile/"],
  ["@/lib/media/media/", "@/lib/media/"],
  ["@/lib/config/config/", "@/lib/config/"],
  ["@/lib/discord/discord/", "@/lib/discord/"],
];
let fixedDoubles = 0;
for (const file of walk(src)) {
  let content = fs.readFileSync(file, "utf8");
  let next = content;
  for (const [from, to] of doubleFixes) {
    next = next.split(from).join(to);
  }
  if (next !== content) {
    fs.writeFileSync(file, next, "utf8");
    fixedDoubles++;
  }
}
if (fixedDoubles) console.log(`Fixed double prefixes in ${fixedDoubles} files.`);
