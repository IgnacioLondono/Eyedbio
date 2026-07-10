"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ExternalLink,
  UserRound,
  Palette,
  Link2,
  Music,
  Share2,
  Globe,
  Sparkles,
  Eye,
  MapPin,
  Save,
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
import { resolveBackgroundType } from "@/lib/media/media-config";
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
import { DashboardMobileNav, DashboardSidebar, type DashboardView } from "@/components/dashboard/DashboardNav";
import DashboardAccountAnalytics, { type AccountSub } from "@/components/dashboard/DashboardAccountAnalytics";
import DashboardPreview from "@/components/dashboard/DashboardPreview";
import MediaUploadGrid from "@/components/dashboard/MediaUploadGrid";
import UnsavedChangesModal from "@/components/dashboard/UnsavedChangesModal";
import {
  DashboardColorField,
  DashboardField,
  DashboardRangeSlider,
  DashboardSection,
  DashboardSectionLabel,
  DashboardSubnav,
  DashboardToggle,
} from "@/components/dashboard/DashboardUi";
import {
  resolveCardLayout,
  resolveLinkStyle,
  suggestedSettingsForLayout,
} from "@/lib/config/card-layout-config";
import { resolveBackgroundDim, resolvePageOverlay, PAGE_OVERLAY_OPTIONS } from "@/lib/profile/profile-overlay-config";
import type { PageOverlay } from "@/lib/profile/profile-overlay-config";

const DASHBOARD_TAB_STORAGE_KEY = "eyed-dashboard-tab";

const MAIN_VIEWS: DashboardView[] = ["links", "customize"];
const VALID_VIEWS: DashboardView[] = [...MAIN_VIEWS, "account"];

function migrateLegacyTab(value: string): DashboardView | null {
  if (value === "general" || value === "profile") return "customize";
  if (value === "media" || value === "appearance") return "customize";
  if (VALID_VIEWS.includes(value as DashboardView)) return value as DashboardView;
  return null;
}

function parseView(value: string | null): DashboardView {
  if (!value) return "customize";
  if (value === "profile") return "customize";
  return migrateLegacyTab(value) ?? "customize";
}

function readStoredDashboardTab(): DashboardView | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(DASHBOARD_TAB_STORAGE_KEY);
    if (stored) return migrateLegacyTab(stored);
  } catch {
    /* ignore */
  }
  return null;
}

function parseAccountSub(value: string | null): AccountSub {
  if (value === "analysis" || value === "visits" || value === "links" || value === "settings") {
    return value;
  }
  return "summary";
}

function parseLinksSub(value: string | null): string {
  return value === "added" ? "added" : "networks";
}

function parseCustomizeSub(value: string | null): string {
  if (
    value === "profile" ||
    value === "info" ||
    value === "page" ||
    value === "social"
  ) {
    return "profile";
  }
  if (
    value === "media" ||
    value === "audio" ||
    value === "background" ||
    value === "structure" ||
    value === "card" ||
    value === "icons" ||
    value === "cursor"
  ) {
    return value;
  }
  if (value === "style") return "background";
  return "profile";
}

function defaultSubForView(view: DashboardView): string {
  if (view === "links") return "networks";
  if (view === "customize") return "profile";
  if (view === "account") return "summary";
  return "";
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
  const view: DashboardView = tabParam ? parseView(tabParam) : "customize";
  const subParam = searchParams.get("sub");
  const accountSub = parseAccountSub(view === "account" ? subParam : null);
  const linksSub = parseLinksSub(view === "links" ? subParam : null);
  const customizeSub = parseCustomizeSub(view === "customize" ? subParam : null);
  const activeSub =
    view === "links"
      ? linksSub
      : view === "customize"
        ? customizeSub
        : view === "account"
          ? accountSub
          : "";
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
    const tab = searchParams.get("tab");
    if (tab === "profile") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "customize");
      params.set("sub", "profile");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }
    if (searchParams.get("tab")) return;
    const stored = readStoredDashboardTab();
    if (stored) {
      const sub = stored === "customize" ? defaultSubForView("customize") : defaultSubForView(stored);
      router.replace(
        sub ? `${pathname}?tab=${stored}&sub=${sub}` : `${pathname}?tab=${stored}`,
        { scroll: false }
      );
    }
  }, [pathname, router, searchParams]);

  const persistTab = (nextView: DashboardView) => {
    try {
      localStorage.setItem(DASHBOARD_TAB_STORAGE_KEY, nextView);
    } catch {
      /* ignore */
    }
  };

  const handleViewChange = (id: DashboardView) => {
    persistTab(id);
    const sub = defaultSubForView(id);
    router.push(sub ? `/dashboard?tab=${id}&sub=${sub}` : `/dashboard?tab=${id}`);
  };

  const setActiveSub = (sub: string) => {
    router.replace(`/dashboard?tab=${view}&sub=${sub}`, { scroll: false });
  };

  const handleAccountSubSelect = (sub: AccountSub) => {
    persistTab("account");
    router.push(`/dashboard?tab=account&sub=${sub}`);
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

  const openAudioManager = () => {
    persistTab("customize");
    router.push("/dashboard?tab=customize&sub=audio");
  };

  const mediaUploadGrid = (
    <MediaUploadGrid
      profile={profile}
      profileAudioEnabled={site.profileAudioEnabled}
      onBackgroundUploaded={(url, backgroundType) => updateBackground(url, backgroundType)}
      onBackgroundClear={clearBackground}
      onBackgroundFocusChange={(backgroundFocus) => updateSettings({ backgroundFocus })}
      onAvatarUploaded={(url) => update({ avatarUrl: url })}
      onAvatarClear={() => {
        update({
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
        });
        updateSettings({ avatarFocus: { x: 50, y: 50, zoom: 1 } });
      }}
      onAvatarFocusChange={(avatarFocus) => updateSettings({ avatarFocus })}
      onCursorUploaded={(url) => updateSettings({ cursorUrl: url })}
      onCursorClear={() => updateSettings({ cursorUrl: "" })}
      onAudioUploaded={(url) =>
        update({
          audioUrl: url,
          audioSource: "upload",
          audioEnabled: true,
          audioStartTime: 0,
          audioClipDuration: 30,
        })
      }
      onAudioClear={() =>
        update({
          audioUrl: undefined,
          audioEnabled: profile.audioSource === "background",
          audioStartTime: 0,
          audioClipDuration: 30,
        })
      }
      onConfigureAudio={openAudioManager}
    />
  );

  const tabs = [
    {
      id: "links" as DashboardView,
      label: t("dashboard.tabs.links"),
      description: t("dashboard.tabDescriptions.links"),
      icon: Link2,
    },
    {
      id: "customize" as DashboardView,
      label: t("dashboard.tabs.customize"),
      description: t("dashboard.tabDescriptions.customize"),
      icon: Palette,
    },
  ];

  const customizeSubLabels: Record<string, string> = {
    profile: t("dashboard.subtabProfile"),
    media: t("dashboard.subtabMedia"),
    audio: t("dashboard.subtabAudio"),
    background: t("dashboard.subtabBackground"),
    structure: t("dashboard.subtabStructure"),
    card: t("dashboard.subtabCard"),
    icons: t("dashboard.subtabIcons"),
    cursor: t("dashboard.subtabCursor"),
  };

  const activeTabMeta =
    view === "account"
      ? {
          label: t(`dashboard.accountSub.${accountSub}`),
          description: t("dashboard.tabDescriptions.account"),
        }
      : view === "customize"
        ? {
            label: customizeSubLabels[customizeSub] ?? tabs[1].label,
            description: t("dashboard.tabDescriptions.customize"),
          }
        : (tabs.find((item) => item.id === view) ?? tabs[0]);

  const subTabItems: Partial<Record<DashboardView, { id: string; label: string }[]>> = {
    links: [
      { id: "networks", label: t("dashboard.subtabNetworks") },
      { id: "added", label: t("dashboard.subtabAddedLinks") },
    ],
    customize: [
      { id: "profile", label: t("dashboard.subtabProfile") },
      { id: "media", label: t("dashboard.subtabMedia") },
      { id: "audio", label: t("dashboard.subtabAudio") },
      { id: "background", label: t("dashboard.subtabBackground") },
      { id: "structure", label: t("dashboard.subtabStructure") },
      { id: "card", label: t("dashboard.subtabCard") },
      { id: "icons", label: t("dashboard.subtabIcons") },
      { id: "cursor", label: t("dashboard.subtabCursor") },
    ],
    account: [
      { id: "summary", label: t("dashboard.accountSub.summary") },
      { id: "analysis", label: t("dashboard.accountSub.analysis") },
      { id: "visits", label: t("dashboard.accountSub.visits") },
      { id: "links", label: t("dashboard.accountSub.linkClicks") },
      { id: "settings", label: t("dashboard.accountSub.settings") },
    ],
  };

  const currentSubTabs = subTabItems[view] ?? [];

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0f] text-white lg:h-dvh lg:overflow-hidden">
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

      <div className="relative flex min-h-0 flex-1 lg:overflow-hidden">
        <DashboardSidebar
          tabs={tabs}
          activeView={view}
          accountSub={accountSub}
          onTabChange={handleViewChange}
          onAccountSubSelect={handleAccountSubSelect}
          username={profile.username}
          displayName={profile.displayName}
          supportEnabled={site.supportEnabled}
        />

        <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-5 sm:px-5 sm:py-6 lg:px-8 [scrollbar-width:thin]">
          {error ? (
            <p className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">
              {error}
            </p>
          ) : null}
          <div className="mb-6 hidden items-center justify-end gap-2 lg:flex">
            {isDirty ? (
              <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200/90">
                {t("dashboard.unsavedBadge")}
              </span>
            ) : justSaved ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300/90">
                {t("dashboard.saved")}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-colors hover:bg-purple-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {justSaved ? t("dashboard.saved") : saving ? t("dashboard.saving") : t("dashboard.save")}
            </button>
          </div>

          <DashboardMobileNav
            tabs={tabs}
            activeView={view}
            accountSub={accountSub}
            onTabChange={handleViewChange}
            onAccountSubSelect={handleAccountSubSelect}
          />

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
              view === "account"
                ? "grid-cols-1"
                : previewMode === "desktop"
                  ? "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px]"
                  : "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]"
            }`}
          >
            <div className="relative z-20 min-w-0 space-y-4">
            {currentSubTabs.length > 0 ? (
              <DashboardSubnav items={currentSubTabs} active={activeSub} onChange={setActiveSub} />
            ) : null}
            {view === "customize" && activeSub === "profile" && (
              <>
                <DashboardSection
                  title={t("dashboard.shareTitle")}
                  hint={t("dashboard.shareHint")}
                  icon={Share2}
                  accent
                >
                  <p className="break-all rounded-xl border border-purple-500/15 bg-purple-500/5 px-3 py-2 font-mono text-xs text-purple-300/90">
                    eyed.bio/{profile.username}
                  </p>
                  <ShareProfileButton
                    username={profile.username}
                    displayName={profile.displayName}
                    variant="inline"
                  />
                </DashboardSection>

                <DashboardSection title={t("dashboard.subtabProfile")} icon={UserRound}>
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
                  <p className="text-xs text-white/40">{t("dashboard.avatarUploadHint")}</p>
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

            {view === "links" && (
              <LinkEditor
                section={linksSub === "added" ? "added" : "networks"}
                links={profile.links}
                linkHidden={profile.settings.linkHidden}
                onChange={(links) => update({ links })}
                onLinkHiddenChange={(linkHidden) => updateSettings({ linkHidden })}
              />
            )}

            {view === "customize" && (
              <>
                {activeSub === "media" && (
                <>
                {mediaUploadGrid}
                <a
                  href={COMMUNITY_MEDIA_HUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-purple-500/25 bg-purple-500/10 p-3 transition-colors hover:bg-purple-500/15"
                >
                  <p className="text-sm font-medium text-white">{t("dashboard.mediaResourcesTitle")}</p>
                  <p className="mt-1 text-xs text-white/45">{t("dashboard.mediaResourcesHint")}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-purple-400">
                    {t("dashboard.mediaResourcesLink")}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </span>
                </a>

                {resolveCardLayout(profile.settings) === "banner" ? (
                  <DashboardSection title={t("dashboard.bannerTitle")} hint={t("dashboard.bannerHint")}>
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
                  </DashboardSection>
                ) : null}
                </>
                )}

                {activeSub === "audio" && site.profileAudioEnabled && (
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
                      <p className="-mt-2 text-[11px] text-white/40">
                        {t("dashboard.audioSourceBackgroundActive")}
                      </p>
                    ) : !profile.audioUrl ? (
                      <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-2.5 text-xs text-white/45">
                        {t("dashboard.audioUploadHint")}
                      </p>
                    ) : null}

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
                        checked={
                          Boolean(profile.settings.musicPlayerEnabled) &&
                          profile.audioSource !== "background"
                        }
                        onChange={(v) => updateSettings({ musicPlayerEnabled: v })}
                        disabled={profile.audioSource === "background"}
                      />

                      {profile.audioSource === "background" ? (
                        <p className="text-[11px] text-amber-300/80">
                          {t("dashboard.musicPlayerBackgroundWarning")}
                        </p>
                      ) : null}

                      {profile.settings.musicPlayerEnabled &&
                        profile.audioSource !== "background" && (
                        <>
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
                )}

                {activeSub === "background" && (
                <>
                <DashboardSection title={t("dashboard.subtabBackground")} icon={Palette}>
                  <DashboardField label={t("dashboard.backgroundEffect")}>
                    <BackgroundEffectSelect
                      value={profile.settings.backgroundEffect}
                      onChange={(backgroundEffect) => updateSettings({ backgroundEffect })}
                    />
                  </DashboardField>

                <DashboardRangeSlider
                  label={tVars("dashboard.backgroundDimLabel", {
                    percent: Math.round(resolveBackgroundDim(profile.settings) * 100),
                  })}
                  value={resolveBackgroundDim(profile.settings)}
                  min={0}
                  max={1}
                  step={0.05}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                  markers={[
                    { value: 0.2, label: "20%" },
                    { value: 0.5, label: "50%" },
                    { value: 0.8, label: "80%" },
                  ]}
                  onChange={(backgroundDim) => updateSettings({ backgroundDim })}
                />

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

                <DashboardRangeSlider
                  label={tVars("dashboard.opacityLabel", {
                    percent: Math.round(profile.settings.profileOpacity * 100),
                  })}
                  value={profile.settings.profileOpacity}
                  min={0}
                  max={1}
                  step={0.01}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                  markers={[
                    { value: 0.2, label: "20%" },
                    { value: 0.5, label: "50%" },
                    { value: 0.8, label: "80%" },
                  ]}
                  onChange={(profileOpacity) => updateSettings({ profileOpacity })}
                  disabled={profile.settings.transparentCard}
                />
                  {profile.settings.transparentCard && (
                    <p className="text-[11px] text-white/30 -mt-2">
                      {t("dashboard.opacityDisabled")}
                    </p>
                  )}

                <DashboardRangeSlider
                  label={tVars("dashboard.blurLabel", { px: profile.settings.profileBlur })}
                  value={profile.settings.profileBlur}
                  min={0}
                  max={40}
                  step={1}
                  formatValue={(v) => `${v}px`}
                  markers={[
                    { value: 8, label: "20px" },
                    { value: 20, label: "50px" },
                    { value: 32, label: "80px" },
                  ]}
                  onChange={(profileBlur) => updateSettings({ profileBlur })}
                />
                </DashboardSection>
                </>
                )}

                {activeSub === "structure" && (
                <>
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
                </>
                )}

                {activeSub === "card" && (
                <>
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

                <DashboardToggle
                  label={t("dashboard.gradientCard")}
                  checked={profile.settings.gradientEnabled}
                  onChange={(v) => updateSettings({ gradientEnabled: v })}
                  disabled={profile.settings.transparentCard}
                />

                </>
                )}

                {activeSub === "icons" && (
                <>
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
                </>
                )}

                {activeSub === "cursor" && (
                <>
                <DashboardSectionLabel>{t("dashboard.cursorSection")}</DashboardSectionLabel>

                <DashboardSection>
                  <p className="text-xs text-white/40">{t("dashboard.cursorUploadHint")}</p>

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
              </>
            )}

            {view === "account" && (
              <>
                {accountSub === "settings" ? (
                  <AccountSettings
                    profileUsername={profile.username}
                    onUsernameUpdated={(username) => update({ username })}
                  />
                ) : (
                  <DashboardAccountAnalytics sub={accountSub} />
                )}
              </>
            )}
            </div>

            {view !== "account" ? (
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
