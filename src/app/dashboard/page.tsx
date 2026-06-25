"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ExternalLink,
  Save,
  UserRound,
  Palette,
  Link2,
  Settings,
  Music,
  LogOut,
  LifeBuoy,
} from "lucide-react";
import {
  Profile,
  BackgroundType,
  NameEffect,
  type NameAnimation,
  type AudioSource,
} from "@/types/profile";
import { NAME_EFFECT_OPTIONS } from "@/lib/name-effects";
import { NAME_ANIMATION_OPTIONS } from "@/lib/name-animations";
import { getMessages } from "@/lib/i18n";
import { resolveBackgroundType, getUploadLimitMb } from "@/lib/media-config";
import { backgroundHasAudio, getEffectiveAudioUrl, isBackgroundProfileAudio } from "@/lib/profile-audio";
import { resolveProfileDisplay } from "@/lib/profile-display-config";
import { useI18n } from "@/components/LocaleProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import ProfileCard from "@/components/ProfileCard";
import BackgroundEffects from "@/components/BackgroundEffects";
import BackgroundEffectSelect from "@/components/BackgroundEffectSelect";
import BackgroundMedia from "@/components/BackgroundMedia";
import FileUpload from "@/components/FileUpload";
import AudioClipSelector from "@/components/AudioClipSelector";
import Logo from "@/components/Logo";
import AppAreaNav from "@/components/AppAreaNav";
import AccountSettings from "@/components/AccountSettings";
import LinkEditor from "@/components/LinkEditor";
import ShareProfileButton from "@/components/ShareProfileButton";
import CommunityDiscordLink from "@/components/CommunityDiscordLink";
import { COMMUNITY_BOT_URL } from "@/lib/community";
import CardLayoutPicker from "@/components/CardLayoutPicker";
import IconStylePicker from "@/components/IconStylePicker";
import {
  resolveCardLayout,
  resolveLinkStyle,
  suggestedSettingsForLayout,
  getCardMaxWidthClass,
} from "@/lib/card-layout-config";
import ProfilePageOverlay, { ProfileBackgroundDim } from "@/components/ProfilePageOverlay";
import { resolveBackgroundDim, resolvePageOverlay, PAGE_OVERLAY_OPTIONS } from "@/lib/profile-overlay-config";
import type { PageOverlay } from "@/lib/profile-overlay-config";

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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
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

  const tabs: { id: Tab; label: string; icon: typeof Settings }[] = [
    { id: "general", label: t("dashboard.tabs.general"), icon: UserRound },
    { id: "links", label: t("dashboard.tabs.links"), icon: Link2 },
    { id: "media", label: t("dashboard.tabs.media"), icon: Music },
    { id: "appearance", label: t("dashboard.tabs.appearance"), icon: Palette },
    { id: "account", label: t("dashboard.tabs.account"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink">
            <Logo href="/" size="sm" responsiveText />
            <AppAreaNav active="dashboard" />
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <CommunityDiscordLink variant="header" />
            {site.supportEnabled ? (
              <Link
                href="/support"
                title={t("dashboard.supportLink")}
                aria-label={t("dashboard.supportLink")}
                className="flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 text-xs text-white/60 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors shrink-0"
              >
                <LifeBuoy className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline ml-1.5">{t("nav.support")}</span>
              </Link>
            ) : null}
            <Link
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleViewProfileClick}
              title={t("dashboard.viewProfile")}
              aria-label={t("dashboard.viewProfile")}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs border rounded-lg transition-colors shrink-0 ${
                isDirty
                  ? "text-amber-200/90 border-amber-400/30 hover:bg-amber-500/10"
                  : "text-white/60 hover:text-white border-white/10 hover:bg-white/5"
              }`}
            >
              <UserRound className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">{t("dashboard.viewProfile")}</span>
              <ExternalLink className="w-3 h-3 shrink-0 hidden sm:block" />
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              title={
                justSaved ? t("dashboard.saved") : saving ? t("dashboard.saving") : t("dashboard.save")
              }
              aria-label={
                justSaved ? t("dashboard.saved") : saving ? t("dashboard.saving") : t("dashboard.save")
              }
              className="flex items-center justify-center gap-1.5 p-1.5 sm:px-4 sm:py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg transition-colors shrink-0"
            >
              <Save className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">
                {justSaved ? t("dashboard.saved") : saving ? t("dashboard.saving") : t("dashboard.save")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
              title={t("dashboard.signOut")}
              aria-label={t("dashboard.signOut")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
            {error}
          </p>
        </div>
      )}

      {showUnsavedModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsaved-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowUnsavedModal(false)}
            aria-label={t("common.close")}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-2xl">
            <h2 id="unsaved-title" className="text-lg font-semibold text-white">
              {t("dashboard.unsavedTitle")}
            </h2>
            <p className="mt-2 text-sm text-white/50 leading-relaxed">
              {t("dashboard.unsavedBody")}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                className="px-4 py-2.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                {t("dashboard.keepEditing")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedModal(false);
                  openProfilePreview();
                }}
                className="px-4 py-2.5 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                {t("dashboard.viewWithoutSave")}
              </button>
              <button
                type="button"
                onClick={handleSaveAndViewProfile}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg transition-colors"
              >
                {saving ? t("dashboard.saving") : t("dashboard.saveAndView")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 grid gap-8 items-start ${
          tab === "account" ? "lg:grid-cols-1" : "lg:grid-cols-2"
        }`}
      >
        <div className="relative z-20 min-w-0 w-full max-w-2xl">
          <div className="grid grid-cols-5 gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-white/[0.03] border border-white/5 rounded-xl mb-6 w-full max-w-xl">
            {tabs.map((tabItem) => {
              const href = `/dashboard?tab=${tabItem.id}`;
              const isCurrent = tab === tabItem.id;

              return (
              <Link
                key={tabItem.id}
                href={href}
                replace
                scroll={false}
                title={tabItem.label}
                aria-label={tabItem.label}
                onClick={(event) => {
                  persistTab(tabItem.id);
                  if (isCurrent) {
                    event.preventDefault();
                    return;
                  }
                  event.preventDefault();
                  router.push(href);
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-2 sm:py-2.5 px-0.5 sm:px-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all min-w-0 ${
                  isCurrent
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <tabItem.icon className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-full hidden sm:inline leading-tight">
                  {tabItem.label}
                </span>
              </Link>
            );
            })}
          </div>

          <div className="space-y-5">
            {tab === "general" && (
              <>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">{t("dashboard.shareTitle")}</h3>
                    <p className="text-xs text-white/40 mt-1">
                      {t("dashboard.shareHint")}
                    </p>
                  </div>
                  <p className="text-xs font-mono text-purple-300/80 break-all">
                    eyed.bio/{profile.username}
                  </p>
                  <ShareProfileButton
                    username={profile.username}
                    displayName={profile.displayName}
                    variant="inline"
                  />
                </div>
                <Field label={t("dashboard.displayName")}>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => update({ displayName: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label={t("common.bio")}>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => update({ bio: e.target.value })}
                    rows={3}
                    className="input-field resize-none"
                    placeholder={t("dashboard.bioPlaceholder")}
                  />
                </Field>
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
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {t("dashboard.entrySectionTitle")}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">
                      {t("dashboard.entrySectionHint")}
                    </p>
                  </div>
                  <Field label={t("dashboard.entryGateText")}>
                    <input
                      type="text"
                      value={profile.settings.entryGateText ?? ""}
                      onChange={(e) => updateSettings({ entryGateText: e.target.value })}
                      placeholder={t("dashboard.entryGateTextPlaceholder")}
                      className="input-field"
                    />
                  </Field>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {t("dashboard.browserTabSectionTitle")}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">
                      {t("dashboard.browserTabSectionHint")}
                    </p>
                  </div>
                  <Field label={t("dashboard.browserTabTitle")}>
                    <input
                      type="text"
                      value={profile.settings.browserTabTitle ?? ""}
                      onChange={(e) => updateSettings({ browserTabTitle: e.target.value })}
                      placeholder={t("dashboard.browserTabTitlePlaceholder")}
                      className="input-field"
                    />
                    <p className="text-xs text-white/35 mt-2">{t("dashboard.browserTabTitleHint")}</p>
                  </Field>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {t("dashboard.profileNameSectionTitle")}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">
                      {t("dashboard.profileNameSectionHint")}
                    </p>
                  </div>
                  <Field label={t("dashboard.nameAnimation")}>
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
                  </Field>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                  <h3 className="text-sm font-medium text-white">
                    {t("dashboard.visibilitySectionTitle")}
                  </h3>
                  <Toggle
                    label={t("dashboard.showViewCount")}
                    checked={resolveProfileDisplay(profile.settings).showViewCount}
                    onChange={(showViewCount) => updateSettings({ showViewCount })}
                  />
                  <Toggle
                    label={t("dashboard.showShareButton")}
                    checked={resolveProfileDisplay(profile.settings).showShareButton}
                    onChange={(showShareButton) => updateSettings({ showShareButton })}
                  />
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {t("dashboard.discordSectionTitle")}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">
                      {t("dashboard.discordSectionHint")}
                    </p>
                  </div>
                  <Toggle
                    label={t("dashboard.showLocation")}
                    checked={resolveProfileDisplay(profile.settings).showLocation}
                    onChange={(showLocation) => updateSettings({ showLocation })}
                  />
                  <Field label={t("dashboard.locationLabel")}>
                    <input
                      type="text"
                      value={profile.settings.location ?? ""}
                      onChange={(e) => updateSettings({ location: e.target.value })}
                      placeholder={t("dashboard.locationPlaceholder")}
                      className="input-field"
                    />
                  </Field>
                  <Toggle
                    label={t("dashboard.discordPresenceEnabled")}
                    checked={resolveProfileDisplay(profile.settings).discordPresenceEnabled}
                    onChange={(discordPresenceEnabled) =>
                      updateSettings({ discordPresenceEnabled })
                    }
                  />
                  <Field label={t("dashboard.discordUserIdLabel")}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={profile.settings.discordUserId ?? ""}
                      onChange={(e) =>
                        updateSettings({ discordUserId: e.target.value.replace(/\D/g, "") })
                      }
                      placeholder={t("dashboard.discordUserIdPlaceholder")}
                      className="input-field font-mono text-sm"
                    />
                    <p className="text-xs text-white/35 mt-2">{t("dashboard.discordUserIdHint")}</p>
                    <a
                      href={COMMUNITY_BOT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {t("dashboard.discordBotLink")} →
                    </a>
                  </Field>
                </div>
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
                    <Field label={t("dashboard.audioSource")}>
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
                    </Field>

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
                    <Toggle
                      label={t("dashboard.playAudio")}
                      checked={profile.audioEnabled}
                      onChange={(v) => update({ audioEnabled: v })}
                      disabled={
                        !getEffectiveAudioUrl(profile) && !profile.audioEnabled
                      }
                    />
                  </>
                ) : null}
              </>
            )}

            {tab === "appearance" && (
              <>
                <Field label={t("dashboard.backgroundEffect")}>
                  <BackgroundEffectSelect
                    value={profile.settings.backgroundEffect}
                    onChange={(backgroundEffect) => updateSettings({ backgroundEffect })}
                  />
                </Field>

                <Field
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
                </Field>

                <Field label={t("dashboard.pageOverlay")}>
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
                </Field>

                <Field
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
                </Field>

                <Field
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
                </Field>

                <p className="text-xs uppercase tracking-wider text-white/40 pt-2">
                  {t("dashboard.structureLinks")}
                </p>

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

                <p className="text-xs uppercase tracking-wider text-white/40 pt-2">
                  {t("dashboard.cardSection")}
                </p>

                <Toggle
                  label={t("dashboard.transparentCard")}
                  checked={profile.settings.transparentCard}
                  onChange={(v) => updateSettings({ transparentCard: v })}
                />
                <Toggle
                  label={t("dashboard.showBorder")}
                  checked={profile.settings.showCardBorder}
                  onChange={(v) => updateSettings({ showCardBorder: v })}
                />
                <Toggle
                  label={t("dashboard.showShadow")}
                  checked={profile.settings.showCardShadow}
                  onChange={(v) => updateSettings({ showCardShadow: v })}
                />

                {profile.settings.showCardBorder && (
                  <Field
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
                  </Field>
                )}

                <p className="text-xs uppercase tracking-wider text-white/40 pt-2">
                  {t("dashboard.colorsSection")}
                </p>

                <ColorField
                  label={t("dashboard.primaryColor")}
                  value={profile.settings.cardColor}
                  onChange={(v) => updateSettings({ cardColor: v })}
                  disabled={profile.settings.transparentCard}
                />

                {profile.settings.gradientEnabled && (
                  <ColorField
                    label={t("dashboard.secondaryColor")}
                    value={profile.settings.cardColorSecondary}
                    onChange={(v) => updateSettings({ cardColorSecondary: v })}
                    disabled={profile.settings.transparentCard}
                  />
                )}

                <ColorField
                  label={t("dashboard.textColor")}
                  value={profile.settings.textColor}
                  onChange={(v) => updateSettings({ textColor: v })}
                />

                <ColorField
                  label={t("dashboard.accentColor")}
                  value={profile.settings.accentColor}
                  onChange={(v) => updateSettings({ accentColor: v })}
                />

                <Field label={t("dashboard.nameEffect")}>
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
                </Field>

                <p className="text-xs uppercase tracking-wider text-white/40 pt-2">
                  {t("dashboard.iconsSection")}
                </p>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
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
                </div>

                <Toggle
                  label={t("dashboard.gradientCard")}
                  checked={profile.settings.gradientEnabled}
                  onChange={(v) => updateSettings({ gradientEnabled: v })}
                  disabled={profile.settings.transparentCard}
                />
              </>
            )}

            {tab === "account" && (
              <AccountSettings
                profileUsername={profile.username}
                onUsernameUpdated={(username) => update({ username })}
              />
            )}
          </div>
        </div>

        <div
          className={`lg:sticky lg:top-20 lg:self-start relative z-10 flex w-full max-w-[340px] flex-col items-center mx-auto ${
            tab === "account" ? "hidden" : ""
          }`}
        >
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3 text-center w-full">
            {t("dashboard.preview")}
          </p>
          {profile ? (
            <div className="mb-3 w-full">
              <Toggle
                label={t("dashboard.previewSimulateEntry")}
                checked={simulateEntryInPreview}
                onChange={setSimulateEntryInPreview}
              />
            </div>
          ) : null}
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 aspect-[9/16] max-h-[min(700px,85vh)] isolate bg-[#0a0a0f]">
            <BackgroundMedia
              url={profile.settings.backgroundUrl}
              type={profile.backgroundType}
              focus={profile.settings.backgroundFocus}
              contained
              videoAudioEnabled={
                site.profileAudioEnabled &&
                profile.audioEnabled &&
                isBackgroundProfileAudio(profile)
              }
              deferPlayback={simulateEntryInPreview}
            />
            <ProfileBackgroundDim
              dim={resolveBackgroundDim(profile.settings)}
              className="z-[2]"
            />
            <ProfilePageOverlay overlay={resolvePageOverlay(profile.settings)} className="z-[3]" />
            <BackgroundEffects effect={profile.settings.backgroundEffect} contained />
            <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden">
              <div className="min-h-full w-full flex items-center justify-center px-5 py-4 sm:px-6 sm:py-6 pointer-events-none">
                <div className="pointer-events-auto shrink-0 w-full mx-auto max-w-[320px]">
                  <ProfileCard
                    key={`${profile.settings.cardLayout}-${profile.settings.linkStyle}`}
                    profile={profile}
                    compact
                  />
                </div>
              </div>
            </div>
            {profile && simulateEntryInPreview ? (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-md pointer-events-none">
                <span className="text-white/75 text-[10px] sm:text-xs tracking-[0.15em] lowercase">
                  {resolveProfileDisplay(profile.settings, profile.locale ?? locale).entryGateText}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-2">{label}</label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Field label={label}>
      <div className={`flex items-center gap-3 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
          disabled={disabled}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field flex-1 font-mono text-sm"
          disabled={disabled}
        />
      </div>
    </Field>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <span className="text-sm text-white/70">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-purple-600" : "bg-white/10"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
