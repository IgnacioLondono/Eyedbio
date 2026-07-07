"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ExternalLink,
  UserRound,
  Palette,
  Link2,
  Settings,
  Music,
  Share2,
  Globe,
  Sparkles,
  Eye,
  MapPin,
} from "lucide-react";
import {
  Profile,
  BackgroundType,
  NameEffect,
  type NameAnimation,
  type AudioSource,
  type CursorTrailEffect,
} from "@/types/profile";
import {
  CURSOR_TRAIL_EFFECTS,
  resolveCursorTrailColor,
  resolveCursorTrailEffect,
} from "@/lib/profile/cursor-config";
import { resolveMusicPlayer, MUSIC_PLAYER_BLUR_MAX } from "@/lib/profile/music-player-config";
import { NAME_EFFECT_OPTIONS } from "@/lib/name-effects";
import { NAME_ANIMATION_OPTIONS } from "@/lib/name-animations";
import { getMessages } from "@/lib/i18n";
import { resolveBackgroundType, getUploadLimitMb } from "@/lib/media/media-config";
import { backgroundHasAudio, getEffectiveAudioUrl, isBackgroundProfileAudio } from "@/lib/profile/profile-audio";
import { resolveProfileDisplay } from "@/lib/profile/profile-display-config";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import BackgroundEffectSelect from "@/components/media/BackgroundEffectSelect";
import FileUpload from "@/components/media/FileUpload";
import AudioClipSelector from "@/components/editor/AudioClipSelector";
import AccountSettings from "@/components/auth/AccountSettings";
import LinkEditor from "@/components/editor/LinkEditor";
import ShareProfileButton from "@/components/profile/ShareProfileButton";
import DiscordAccountLink from "@/components/auth/DiscordAccountLink";
import { COMMUNITY_MEDIA_HUB_URL } from "@/lib/config/community";
import CardLayoutPicker from "@/components/editor/CardLayoutPicker";
import IconStylePicker from "@/components/editor/IconStylePicker";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { DashboardMobileNav, DashboardSidebar } from "@/components/dashboard/DashboardNav";
import DashboardPreview from "@/components/dashboard/DashboardPreview";
import UnsavedChangesModal from "@/components/dashboard/UnsavedChangesModal";
import {
  DashboardColorField,
  DashboardField,
  DashboardSection,
  DashboardSectionLabel,
  DashboardToggle,
} from "@/components/dashboard/DashboardUi";
import {
  resolveCardLayout,
  resolveLinkStyle,
  suggestedSettingsForLayout,
} from "@/lib/config/card-layout-config";
import { resolveBackgroundDim, resolvePageOverlay, PAGE_OVERLAY_OPTIONS } from "@/lib/profile/profile-overlay-config";
import type { PageOverlay } from "@/lib/profile/profile-overlay-config";

type Tab = "general" | "links" | "media" | "appearance" | "account";

const VALID_TABS: Tab[] = ["general", "links", "media", "appearance", "account"];
const DASHBOARD_TAB_STORAGE_KEY = "eyed-dashboard-tab";

function parseTab(value: string | null): Tab {
  if (value && VALID_TABS.includes(value as Tab)) return value as Tab;
  return "general";
}

function readStoredDashboardTab(): Tab | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(DASHBOARD_TAB_STORAGE_KEY);
    if (stored && VALID_TABS.includes(stored as Tab)) return stored as Tab;
  } catch {
    /* ignore */
  }
  return null;
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#07070c] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { t, tVars, locale, setLocale } = useI18n();
  const site = useSiteSettings();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const profileRef = useRef<Profile | null>(null);
  const tabParam = searchParams.get("tab");
  const tab: Tab = tabParam ? parseTab(tabParam) : "general";
  const [isDirty, setIsDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [simulateEntryInPreview, setSimulateEntryInPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    if (profile?.locale) void setLocale(profile.locale, false);
  }, [profile?.locale, setLocale]);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        if (res.status === 401) throw new Error("SESSION_EXPIRED");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            typeof data.error === "string" ? data.error : t("dashboard.loadError")
          );
        }
        return res.json();
      })
      .then((data) => {
        profileRef.current = data;
        setProfile(data);
        setIsDirty(false);
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "SESSION_EXPIRED") {
          setError(t("dashboard.sessionExpired"));
          return;
        }
        setError(err instanceof Error ? err.message : t("dashboard.loadError"));
      });
  }, []);

  useEffect(() => {
    if (searchParams.get("discordLinked") !== "1") return;

    fetch("/api/profile")
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        profileRef.current = data;
        setProfile(data);
        setIsDirty(false);
      })
      .finally(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("discordLinked");
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (searchParams.get("tab")) return;
    const stored = readStoredDashboardTab();
    if (stored && stored !== "general") {
      router.replace(`${pathname}?tab=${stored}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const persistTab = (nextTab: Tab) => {
    try {
      localStorage.setItem(DASHBOARD_TAB_STORAGE_KEY, nextTab);
    } catch {
      /* ignore */
    }
  };

  const patchProfile = (updater: (current: Profile) => Profile) => {
    setProfile((current) => {
      if (!current) return current;
      const next = updater(current);
      profileRef.current = next;
      return next;
    });
    setIsDirty(true);
  };

  const update = (partial: Partial<Profile>) => {
    patchProfile((current) => ({ ...current, ...partial }));
  };

  const updateSettings = (
    partial:
      | Partial<Profile["settings"]>
      | ((current: Profile["settings"]) => Partial<Profile["settings"]>)
  ) => {
    patchProfile((current) => {
      const patch = typeof partial === "function" ? partial(current.settings) : partial;
      if (Object.keys(patch).length === 0) return current;
      return {
        ...current,
        settings: { ...current.settings, ...patch },
      };
    });
  };

  const updateBackground = (url: string, backgroundType?: BackgroundType) => {
    patchProfile((current) => {
      const nextType = backgroundType ?? resolveBackgroundType(url, current.backgroundType);
      const losesBackgroundAudio =
        nextType !== "video" && current.audioSource === "background";
      return {
        ...current,
        backgroundType: nextType,
        ...(losesBackgroundAudio ? { audioSource: "upload" as AudioSource } : {}),
        ...(losesBackgroundAudio && !current.audioUrl ? { audioEnabled: false } : {}),
        settings: {
          ...current.settings,
          backgroundUrl: url,
          ...(nextType === "video"
            ? { backgroundFocus: { x: 50, y: 50, zoom: 1 } }
            : {}),
        },
      };
    });
  };

  const clearBackground = () => {
    patchProfile((current) => {
      const losesBackgroundAudio = current.audioSource === "background";
      return {
        ...current,
        backgroundType: "image",
        ...(losesBackgroundAudio ? { audioSource: "upload" as AudioSource } : {}),
        ...(losesBackgroundAudio && !current.audioUrl ? { audioEnabled: false } : {}),
        settings: {
          ...current.settings,
          backgroundUrl: "",
          backgroundFocus: { x: 50, y: 50, zoom: 1 },
        },
      };
    });
  };

  const handleSave = async (): Promise<boolean> => {
    const snapshot = profileRef.current ?? profile;
    if (!snapshot) return false;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });

      const data = await res.json();
      if (res.status === 409) {
        throw new Error(data.error ?? t("dashboard.conflictError"));
      }
      if (!res.ok) throw new Error(data.error ?? t("dashboard.saveError"));

      profileRef.current = data;
      setProfile(data);
      setIsDirty(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("dashboard.saveError"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openProfilePreview = () => {
    if (!profile) return;
    window.open(`/${profile.username}`, "_blank", "noopener,noreferrer");
  };

  const handleViewProfileClick = (event: React.MouseEvent) => {
    if (!isDirty) return;
    event.preventDefault();
    setShowUnsavedModal(true);
  };

  const handleSaveAndViewProfile = async () => {
    const ok = await handleSave();
    if (ok) {
      setShowUnsavedModal(false);
      openProfilePreview();
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-3">
        {error ? (
          <>
            <p className="text-white/50 text-sm">{error}</p>
            <Link href="/login" className="text-purple-400 text-sm hover:underline">
              {t("dashboard.goLogin")}
            </Link>
          </>
        ) : (
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    );
  }

  const nameEffectLabels = getMessages(locale).nameEffects;
  const nameAnimationLabels = getMessages(locale).nameAnimations;

  const handleTabChange = (id: string) => {
    persistTab(parseTab(id));
    router.push(`/dashboard?tab=${id}`);
  };

  const tabs = [
    {
      id: "general" as Tab,
      label: t("dashboard.tabs.general"),
      description: t("dashboard.tabDescriptions.general"),
      icon: UserRound,
    },
    {
      id: "links" as Tab,
      label: t("dashboard.tabs.links"),
      description: t("dashboard.tabDescriptions.links"),
      icon: Link2,
    },
    {
      id: "media" as Tab,
      label: t("dashboard.tabs.media"),
      description: t("dashboard.tabDescriptions.media"),
      icon: Music,
    },
    {
      id: "appearance" as Tab,
      label: t("dashboard.tabs.appearance"),
      description: t("dashboard.tabDescriptions.appearance"),
      icon: Palette,
    },
    {
      id: "account" as Tab,
      label: t("dashboard.tabs.account"),
      description: t("dashboard.tabDescriptions.account"),
      icon: Settings,
    },
  ];

  const activeTabMeta = tabs.find((item) => item.id === tab) ?? tabs[0];

  return (
    <div className="min-h-screen bg-[#07070c] text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.12),transparent)]"
        aria-hidden
      />

      <DashboardHeader
        username={profile.username}
        isDirty={isDirty}
        justSaved={justSaved}
        saving={saving}
        supportEnabled={site.supportEnabled}
        onSave={() => void handleSave()}
        onViewProfile={handleViewProfileClick}
      />

      {error ? (
        <div className="relative mx-auto max-w-[1600px] px-3 pt-4 sm:px-5">
          <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        </div>
      ) : null}

      <UnsavedChangesModal
        open={showUnsavedModal}
        saving={saving}
        onClose={() => setShowUnsavedModal(false)}
        onViewWithoutSave={() => {
          setShowUnsavedModal(false);
          openProfilePreview();
        }}
        onSaveAndView={() => void handleSaveAndViewProfile()}
      />

      <div className="relative mx-auto flex max-w-[1600px]">
        <DashboardSidebar tabs={tabs} activeTab={tab} onTabChange={handleTabChange} />

        <main className="min-w-0 flex-1 px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
          <DashboardMobileNav tabs={tabs} activeTab={tab} onTabChange={handleTabChange} />

          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {activeTabMeta.label}
              </h1>
              <p className="mt-1 text-sm text-white/40">{activeTabMeta.description}</p>
            </div>
            {isDirty ? (
              <span className="inline-flex w-fit items-center rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200/90 md:hidden">
                {t("dashboard.unsavedBadge")}
              </span>
            ) : null}
          </div>

          <div
            className={`grid items-start gap-8 ${
              tab === "account"
                ? "grid-cols-1"
                : previewMode === "desktop"
                  ? "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px]"
                  : "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]"
            }`}
          >
            <div className="relative z-20 min-w-0 space-y-4">
            {tab === "general" && (
              <>
                <DashboardSection
                  title={t("dashboard.shareTitle")}
                  hint={t("dashboard.shareHint")}
                  icon={Share2}
                  accent
                >
                  <p className="rounded-xl border border-purple-500/15 bg-purple-500/5 px-3 py-2 text-xs font-mono text-purple-300/90 break-all">
                    eyed.bio/{profile.username}
                  </p>
                  <ShareProfileButton
                    username={profile.username}
                    displayName={profile.displayName}
                    variant="inline"
                  />
                </DashboardSection>

                <DashboardSection title={t("dashboard.tabs.general")} icon={UserRound}>
                  <DashboardField label={t("dashboard.displayName")}>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => update({ displayName: e.target.value })}
                      className="input-field"
                    />
                  </DashboardField>
                  <DashboardField label={t("common.bio")}>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => update({ bio: e.target.value })}
                      rows={3}
                      className="input-field resize-none"
                      placeholder={t("dashboard.bioPlaceholder")}
                    />
                  </DashboardField>
                  <FileUpload
                    kind="avatar"
                    label={t("dashboard.avatarLabel")}
                    hint={t("dashboard.avatarHint")}
                    currentUrl={profile.avatarUrl}
                    mediaFocus={profile.settings.avatarFocus}
                    onMediaFocusChange={(avatarFocus) => updateSettings({ avatarFocus })}
                    onUploaded={(url) => update({ avatarUrl: url })}
                    onClear={() => {
                      update({
                        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
                      });
                      updateSettings({ avatarFocus: { x: 50, y: 50, zoom: 1 } });
                    }}
                  />
                </DashboardSection>

                <DashboardSection
                  title={t("dashboard.entrySectionTitle")}
                  hint={t("dashboard.entrySectionHint")}
                  icon={Sparkles}
                >
                  <DashboardField label={t("dashboard.entryGateText")}>
                    <input
                      type="text"
                      value={profile.settings.entryGateText ?? ""}
                      onChange={(e) => updateSettings({ entryGateText: e.target.value })}
                      placeholder={t("dashboard.entryGateTextPlaceholder")}
                      className="input-field"
                    />
                  </DashboardField>
                </DashboardSection>

                <DashboardSection
                  title={t("dashboard.browserTabSectionTitle")}
                  hint={t("dashboard.browserTabSectionHint")}
                  icon={Globe}
                >
                  <DashboardField label={t("dashboard.browserTabTitle")}>
                    <input
                      type="text"
                      value={profile.settings.browserTabTitle ?? ""}
                      onChange={(e) => updateSettings({ browserTabTitle: e.target.value })}
                      placeholder={t("dashboard.browserTabTitlePlaceholder")}
                      className="input-field"
                    />
                    <p className="mt-2 text-xs text-white/35">{t("dashboard.browserTabTitleHint")}</p>
                  </DashboardField>
                </DashboardSection>

                <DashboardSection
                  title={t("dashboard.profileNameSectionTitle")}
                  hint={t("dashboard.profileNameSectionHint")}
                  icon={Sparkles}
                >
                  <DashboardField label={t("dashboard.nameAnimation")}>
                    <select
                      value={profile.settings.nameAnimation ?? "none"}
                      onChange={(e) =>
                        updateSettings({ nameAnimation: e.target.value as NameAnimation })
                      }
                      className="input-field"
                    >
                      {NAME_ANIMATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {nameAnimationLabels[opt.value] ?? opt.label}
                        </option>
                      ))}
                    </select>
                  </DashboardField>
                </DashboardSection>

                <DashboardSection title={t("dashboard.visibilitySectionTitle")} icon={Eye}>
                  <DashboardToggle
                    label={t("dashboard.showViewCount")}
                    checked={resolveProfileDisplay(profile.settings).showViewCount}
                    onChange={(showViewCount) => updateSettings({ showViewCount })}
                  />
                  <DashboardToggle
                    label={t("dashboard.showShareButton")}
                    checked={resolveProfileDisplay(profile.settings).showShareButton}
                    onChange={(showShareButton) => updateSettings({ showShareButton })}
                  />
                </DashboardSection>

                <DashboardSection
                  title={t("dashboard.discordSectionTitle")}
                  hint={t("dashboard.discordSectionHint")}
                  icon={MapPin}
                >
                  <DashboardToggle
                    label={t("dashboard.showLocation")}
                    checked={resolveProfileDisplay(profile.settings).showLocation}
                    onChange={(showLocation) => updateSettings({ showLocation })}
                  />
                  <DashboardField label={t("dashboard.locationLabel")}>
                    <input
                      type="text"
                      value={profile.settings.location ?? ""}
                      onChange={(e) => updateSettings({ location: e.target.value })}
                      placeholder={t("dashboard.locationPlaceholder")}
                      className="input-field"
                    />
                  </DashboardField>
                  <DashboardToggle
                    label={t("dashboard.discordPresenceEnabled")}
                    checked={resolveProfileDisplay(profile.settings).discordPresenceEnabled}
                    onChange={(discordPresenceEnabled) =>
                      updateSettings({ discordPresenceEnabled })
                    }
                  />
                  <DashboardField label={t("dashboard.discordAccountLabel")}>
                    <DiscordAccountLink
                      currentDiscordUserId={profile.settings.discordUserId ?? ""}
                      onLinked={(discordUserId) =>
                        updateSettings((settings) => {
                          if (
                            settings.discordUserId === discordUserId &&
                            settings.discordPresenceEnabled
                          ) {
                            return {};
                          }
                          return {
                            discordUserId,
                            discordPresenceEnabled: true,
                          };
                        })
                      }
                      onUnlinked={() =>
                        updateSettings((settings) =>
                          settings.discordUserId ? { discordUserId: "" } : {}
                        )
                      }
                    />
                  </DashboardField>
                </DashboardSection>
              </>
            )}

            {tab === "links" && (
              <LinkEditor
                links={profile.links}
                onChange={(links) => update({ links })}
              />
            )}

            {tab === "media" && (
              <>
                <a
                  href={COMMUNITY_MEDIA_HUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/15 transition-colors"
                >
                  <p className="text-sm font-medium text-white">{t("dashboard.mediaResourcesTitle")}</p>
                  <p className="text-xs text-white/45 mt-1">{t("dashboard.mediaResourcesHint")}</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-purple-400">
                    {t("dashboard.mediaResourcesLink")}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </span>
                </a>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white">{t("dashboard.backgroundTitle")}</h3>
                    <p className="text-xs text-white/40 mt-1 mb-3">
                      {t("dashboard.backgroundHint")}
                    </p>
                    <FileUpload
                      kind="background"
                      label=""
                      hint={tVars("dashboard.backgroundHintSave", {
                        limit: getUploadLimitMb("background"),
                      })}
                      currentUrl={profile.settings.backgroundUrl}
                      mediaType={profile.backgroundType}
                      mediaFocus={profile.settings.backgroundFocus}
                      onMediaFocusChange={(backgroundFocus) =>
                        updateSettings({ backgroundFocus })
                      }
                      onUploaded={(url, backgroundType) => updateBackground(url, backgroundType)}
                      onClear={clearBackground}
                    />
                  </div>
                </div>

                {resolveCardLayout(profile.settings) === "banner" && (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-purple-500/20 space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-white">{t("dashboard.bannerTitle")}</h3>
                      <p className="text-xs text-white/40 mt-1 mb-3">
                        {t("dashboard.bannerHint")}
                      </p>
                      <FileUpload
                        kind="banner"
                        label=""
                        hint={t("dashboard.bannerFileHint")}
                        currentUrl={profile.settings.bannerUrl}
                        mediaFocus={profile.settings.bannerFocus}
                        onMediaFocusChange={(bannerFocus) => updateSettings({ bannerFocus })}
                        onUploaded={(url) => updateSettings({ bannerUrl: url })}
                        onClear={() =>
                          updateSettings({
                            bannerUrl: "",
                            bannerFocus: { x: 50, y: 50, zoom: 1 },
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {site.profileAudioEnabled ? (
                  <>
                    <DashboardField label={t("dashboard.audioSource")}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => update({ audioSource: "upload" })}
                          className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors ${
                            profile.audioSource !== "background"
                              ? "border-purple-500/50 bg-purple-500/15 text-white"
                              : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80"
                          }`}
                        >
                          <span className="block font-medium">{t("dashboard.audioSourceUpload")}</span>
                          <span className="mt-0.5 block text-[10px] text-white/45">
                            {t("dashboard.audioSourceUploadHint")}
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled={!backgroundHasAudio(profile)}
                          onClick={() =>
                            update({
                              audioSource: "background",
                              audioEnabled: true,
                              audioStartTime: 0,
                              audioClipDuration: 0,
                            })
                          }
                          className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                            profile.audioSource === "background"
                              ? "border-purple-500/50 bg-purple-500/15 text-white"
                              : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80"
                          }`}
                        >
                          <span className="block font-medium">
                            {t("dashboard.audioSourceBackground")}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-white/45">
                            {backgroundHasAudio(profile)
                              ? t("dashboard.audioSourceBackgroundHint")
                              : t("dashboard.audioSourceBackgroundDisabled")}
                          </span>
                        </button>
                      </div>
                    </DashboardField>

                    {profile.audioSource === "background" ? (
                      <p className="text-[11px] text-white/40 -mt-2">
                        {t("dashboard.audioSourceBackgroundActive")}
                      </p>
                    ) : (
                      <FileUpload
                        kind="audio"
                        label={t("dashboard.audioLabel")}
                        hint={t("dashboard.audioHint")}
                        currentUrl={profile.audioUrl}
                        onUploaded={(url) =>
                          update({
                            audioUrl: url,
                            audioEnabled: true,
                            audioStartTime: 0,
                            audioClipDuration: 30,
                          })
                        }
                        onClear={() =>
                          update({
                            audioUrl: undefined,
                            audioEnabled: profile.audioSource === "background",
                            audioStartTime: 0,
                            audioClipDuration: 30,
                          })
                        }
                      />
                    )}

                    {profile.audioSource !== "background" && profile.audioUrl ? (
                      <AudioClipSelector
                        audioUrl={profile.audioUrl}
                        startTime={profile.audioStartTime}
                        clipDuration={profile.audioClipDuration}
                        onChange={({ startTime, clipDuration }) =>
                          patchProfile((current) => ({
                            ...current,
                            audioStartTime: startTime,
                            audioClipDuration: clipDuration,
                            settings: {
                              ...current.settings,
                              audioStartTime: startTime,
                              audioClipDuration: clipDuration,
                            },
                          }))
                        }
                      />
                    ) : null}
                    <DashboardToggle
                      label={t("dashboard.playAudio")}
                      checked={profile.audioEnabled}
                      onChange={(v) => update({ audioEnabled: v })}
                      disabled={
                        !getEffectiveAudioUrl(profile) && !profile.audioEnabled
                      }
                    />

                    <DashboardSection
                      title={t("dashboard.musicPlayerTitle")}
                      hint={t("dashboard.musicPlayerHint")}
                      icon={Music}
                    >
                      <DashboardToggle
                        label={t("dashboard.musicPlayerEnabled")}
                        checked={Boolean(profile.settings.musicPlayerEnabled)}
                        onChange={(v) => updateSettings({ musicPlayerEnabled: v })}
                      />

                      {profile.settings.musicPlayerEnabled && (
                        <>
                          {profile.audioSource === "background" ? (
                            <p className="text-[11px] text-amber-300/80">
                              {t("dashboard.musicPlayerBackgroundWarning")}
                            </p>
                          ) : null}

                          <FileUpload
                            kind="musicCover"
                            label={t("dashboard.musicPlayerCoverLabel")}
                            hint={t("dashboard.musicPlayerCoverHint")}
                            currentUrl={profile.settings.musicPlayerCoverUrl}
                            onUploaded={(url) =>
                              updateSettings({ musicPlayerCoverUrl: url })
                            }
                            onClear={() => updateSettings({ musicPlayerCoverUrl: "" })}
                          />

                          <DashboardField label={t("dashboard.musicPlayerSongTitle")}>
                            <input
                              type="text"
                              value={profile.settings.musicPlayerTitle ?? ""}
                              onChange={(e) =>
                                updateSettings({ musicPlayerTitle: e.target.value })
                              }
                              placeholder={t("dashboard.musicPlayerSongTitlePlaceholder")}
                              className="input-field"
                            />
                          </DashboardField>

                          <DashboardField label={t("dashboard.musicPlayerArtist")}>
                            <input
                              type="text"
                              value={profile.settings.musicPlayerArtist ?? ""}
                              onChange={(e) =>
                                updateSettings({ musicPlayerArtist: e.target.value })
                              }
                              placeholder={t("dashboard.musicPlayerArtistPlaceholder")}
                              className="input-field"
                            />
                          </DashboardField>

                          <DashboardColorField
                            label={t("dashboard.musicPlayerColor")}
                            value={resolveMusicPlayer(profile).baseColor}
                            onChange={(v) => updateSettings({ musicPlayerColor: v })}
                          />

                          <DashboardColorField
                            label={t("dashboard.musicPlayerTextColor")}
                            value={resolveMusicPlayer(profile).textColor}
                            onChange={(v) => updateSettings({ musicPlayerTextColor: v })}
                          />

                          <DashboardField
                            label={tVars("dashboard.musicPlayerBlur", {
                              px: resolveMusicPlayer(profile).blur,
                            })}
                          >
                            <input
                              type="range"
                              min="0"
                              max={MUSIC_PLAYER_BLUR_MAX}
                              step="1"
                              value={resolveMusicPlayer(profile).blur}
                              onChange={(e) =>
                                updateSettings({
                                  musicPlayerBlur: parseInt(e.target.value),
                                })
                              }
                              className="w-full accent-purple-500"
                            />
                          </DashboardField>
                        </>
                      )}
                    </DashboardSection>
                  </>
                ) : null}
              </>
            )}

            {tab === "appearance" && (
              <>
                <DashboardSection title={t("dashboard.tabs.appearance")} icon={Palette}>
                  <DashboardField label={t("dashboard.backgroundEffect")}>
                    <BackgroundEffectSelect
                      value={profile.settings.backgroundEffect}
                      onChange={(backgroundEffect) => updateSettings({ backgroundEffect })}
                    />
                  </DashboardField>

                <DashboardField
                  label={tVars("dashboard.backgroundDimLabel", {
                    percent: Math.round(resolveBackgroundDim(profile.settings) * 100),
                  })}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={resolveBackgroundDim(profile.settings)}
                    onChange={(e) =>
                      updateSettings({ backgroundDim: parseFloat(e.target.value) })
                    }
                    className="w-full accent-purple-500"
                  />
                </DashboardField>

                <DashboardField label={t("dashboard.pageOverlay")}>
                  <select
                    value={resolvePageOverlay(profile.settings)}
                    onChange={(e) =>
                      updateSettings({ pageOverlay: e.target.value as PageOverlay })
                    }
                    className="input-field"
                  >
                    {PAGE_OVERLAY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.labelKey)}
                      </option>
                    ))}
                  </select>
                </DashboardField>

                <DashboardField
                  label={tVars("dashboard.opacityLabel", {
                    percent: Math.round(profile.settings.profileOpacity * 100),
                  })}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={profile.settings.profileOpacity}
                    onChange={(e) =>
                      updateSettings({ profileOpacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-purple-500"
                    disabled={profile.settings.transparentCard}
                  />
                  {profile.settings.transparentCard && (
                    <p className="text-[11px] text-white/30 mt-1.5">
                      {t("dashboard.opacityDisabled")}
                    </p>
                  )}
                </DashboardField>

                <DashboardField
                  label={tVars("dashboard.blurLabel", { px: profile.settings.profileBlur })}
                >
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={profile.settings.profileBlur}
                    onChange={(e) =>
                      updateSettings({ profileBlur: parseInt(e.target.value) })
                    }
                    className="w-full accent-purple-500"
                  />
                </DashboardField>
                </DashboardSection>

                <DashboardSectionLabel>{t("dashboard.structureLinks")}</DashboardSectionLabel>

                <CardLayoutPicker
                  cardLayout={resolveCardLayout(profile.settings)}
                  linkStyle={resolveLinkStyle(profile.settings)}
                  avatarStyle={profile.settings.avatarStyle}
                  onSelectLayout={(layout) =>
                    updateSettings((s) => {
                      const suggestions = suggestedSettingsForLayout(layout);
                      return {
                        cardLayout: layout,
                        ...suggestions,
                        linkStyle: resolveLinkStyle({
                          ...s,
                          cardLayout: layout,
                          ...suggestions,
                        }),
                      };
                    })
                  }
                  onLinkStyleChange={(linkStyle) => updateSettings({ linkStyle })}
                  onAvatarStyleChange={(avatarStyle) => updateSettings({ avatarStyle })}
                />

                <DashboardSectionLabel>{t("dashboard.cardSection")}</DashboardSectionLabel>

                <DashboardToggle
                  label={t("dashboard.transparentCard")}
                  checked={profile.settings.transparentCard}
                  onChange={(v) => updateSettings({ transparentCard: v })}
                />
                <DashboardToggle
                  label={t("dashboard.showBorder")}
                  checked={profile.settings.showCardBorder}
                  onChange={(v) => updateSettings({ showCardBorder: v })}
                />
                <DashboardToggle
                  label={t("dashboard.showShadow")}
                  checked={profile.settings.showCardShadow}
                  onChange={(v) => updateSettings({ showCardShadow: v })}
                />

                {profile.settings.showCardBorder && (
                  <DashboardField
                    label={tVars("dashboard.borderOpacity", {
                      percent: Math.round(profile.settings.borderOpacity * 100),
                    })}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={profile.settings.borderOpacity}
                      onChange={(e) =>
                        updateSettings({ borderOpacity: parseFloat(e.target.value) })
                      }
                      className="w-full accent-purple-500"
                    />
                  </DashboardField>
                )}

                <p className="text-xs uppercase tracking-wider text-white/40 pt-2">
                  {t("dashboard.colorsSection")}
                </p>

                <DashboardColorField
                  label={t("dashboard.primaryColor")}
                  value={profile.settings.cardColor}
                  onChange={(v) => updateSettings({ cardColor: v })}
                  disabled={profile.settings.transparentCard}
                />

                {profile.settings.gradientEnabled && (
                  <DashboardColorField
                    label={t("dashboard.secondaryColor")}
                    value={profile.settings.cardColorSecondary}
                    onChange={(v) => updateSettings({ cardColorSecondary: v })}
                    disabled={profile.settings.transparentCard}
                  />
                )}

                <DashboardColorField
                  label={t("dashboard.textColor")}
                  value={profile.settings.textColor}
                  onChange={(v) => updateSettings({ textColor: v })}
                />

                <DashboardColorField
                  label={t("dashboard.accentColor")}
                  value={profile.settings.accentColor}
                  onChange={(v) => updateSettings({ accentColor: v })}
                />

                <DashboardField label={t("dashboard.nameEffect")}>
                  <select
                    value={profile.settings.nameEffect}
                    onChange={(e) =>
                      updateSettings({ nameEffect: e.target.value as NameEffect })
                    }
                    className="input-field"
                  >
                    {NAME_EFFECT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {nameEffectLabels[opt.value] ?? opt.value}
                      </option>
                    ))}
                  </select>
                </DashboardField>

                <DashboardSectionLabel>{t("dashboard.iconsSection")}</DashboardSectionLabel>

                <DashboardSection>
                  <IconStylePicker
                    settings={profile.settings}
                    onChange={(patch) => updateSettings(patch)}
                  />
                  <FileUpload
                    kind="profileIcon"
                    label={t("dashboard.profileNameIconLabel")}
                    hint={t("dashboard.profileNameIconHint")}
                    currentUrl={profile.settings.profileNameIconUrl}
                    onUploaded={(url) => updateSettings({ profileNameIconUrl: url })}
                    onClear={() => updateSettings({ profileNameIconUrl: "" })}
                  />
                  <FileUpload
                    kind="favicon"
                    label={t("dashboard.browserTabIconLabel")}
                    hint={t("dashboard.browserTabIconHint")}
                    currentUrl={profile.settings.browserTabIconUrl}
                    onUploaded={(url) => updateSettings({ browserTabIconUrl: url })}
                    onClear={() => updateSettings({ browserTabIconUrl: "" })}
                  />
                </DashboardSection>

                <DashboardToggle
                  label={t("dashboard.gradientCard")}
                  checked={profile.settings.gradientEnabled}
                  onChange={(v) => updateSettings({ gradientEnabled: v })}
                  disabled={profile.settings.transparentCard}
                />

                <DashboardSectionLabel>{t("dashboard.cursorSection")}</DashboardSectionLabel>

                <DashboardSection>
                  <FileUpload
                    kind="cursor"
                    label={t("dashboard.cursorImageLabel")}
                    hint={t("dashboard.cursorImageHint")}
                    currentUrl={profile.settings.cursorUrl}
                    onUploaded={(url) => updateSettings({ cursorUrl: url })}
                    onClear={() => updateSettings({ cursorUrl: "" })}
                  />

                  <DashboardToggle
                    label={t("dashboard.cursorTrailEnabled")}
                    checked={Boolean(profile.settings.cursorTrailEnabled)}
                    onChange={(v) => updateSettings({ cursorTrailEnabled: v })}
                  />

                  {profile.settings.cursorTrailEnabled && (
                    <>
                      <DashboardField label={t("dashboard.cursorTrailEffect")}>
                        <select
                          value={resolveCursorTrailEffect(
                            profile.settings.cursorTrailEffect
                          )}
                          onChange={(e) =>
                            updateSettings({
                              cursorTrailEffect: e.target.value as CursorTrailEffect,
                            })
                          }
                          className="input-field"
                        >
                          {CURSOR_TRAIL_EFFECTS.map((effect) => (
                            <option key={effect} value={effect}>
                              {t(`dashboard.cursorTrailEffect_${effect}`)}
                            </option>
                          ))}
                        </select>
                      </DashboardField>

                      <DashboardColorField
                        label={t("dashboard.cursorTrailColor")}
                        value={resolveCursorTrailColor(profile.settings)}
                        onChange={(v) => updateSettings({ cursorTrailColor: v })}
                      />
                    </>
                  )}
                </DashboardSection>
              </>
            )}

            {tab === "account" && (
              <AccountSettings
                profileUsername={profile.username}
                onUsernameUpdated={(username) => update({ username })}
              />
            )}
            </div>

            {tab !== "account" ? (
              <DashboardPreview
                profile={profile}
                profileAudioEnabled={site.profileAudioEnabled}
                simulateEntry={simulateEntryInPreview}
                onSimulateEntryChange={setSimulateEntryInPreview}
                onPreviewModeChange={setPreviewMode}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
