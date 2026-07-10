"use client";

import { useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Globe,
  GripVertical,
  Link2,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { SocialLink, SocialPlatform } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/config/platforms";
import { LINK_PICKER_PLATFORMS, getPlatformUrlPlaceholder } from "@/lib/config/platform-categories";
import { isPlatformUsernameField, sanitizeSocialLinkInput } from "@/lib/social-link-utils";
import CustomLinkIcon from "@/components/profile/CustomLinkIcon";
import { PlatformIcon } from "@/components/shared/PlatformIcons";
import PlatformBrandTile, { getPlatformTileStyles } from "@/components/editor/PlatformBrandTile";
import { HintTooltip } from "@/components/shared/HintTooltip";
import { createEmptyLink } from "@/lib/profile/profile-mapper";
import {
  MAX_CUSTOM_LINKS,
  MAX_PLATFORM_LINKS,
  MAX_PROFILE_LINKS,
  canAddCustomLink,
  canAddLink,
  canAddPlatformLink,
  canAddSocialLink,
  countActiveCustomLinks,
  countActivePlatformLinks,
  countActiveSocialLinks,
  countDraftSocialLinks,
} from "@/lib/config/links-config";
import { isSocialLinkActive } from "@/lib/social-link-utils";
import { ACCEPT_ATTR, getUploadValidationError } from "@/lib/media/media-config";
import { useI18n } from "@/components/providers/LocaleProvider";

interface Props {
  links: SocialLink[];
  linkHidden?: Record<string, boolean>;
  section?: "networks" | "added" | "all";
  onChange: (links: SocialLink[]) => void;
  onLinkHiddenChange: (linkHidden: Record<string, boolean>) => void;
}

function LinkIconButton({
  link,
  onUploaded,
}: {
  link: SocialLink;
  onUploaded: (url: string) => void;
}) {
  const { t, tVars } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const config = PLATFORM_CONFIG[link.platform];
  const isCustom = link.platform === "custom";

  const handleFile = async (file: File) => {
    const validation = getUploadValidationError("linkIcon", file);
    if (validation) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "linkIcon");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("linkEditor.uploadError"));
      onUploaded(data.url);
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const tileStyle =
    link.iconUrl || isCustom
      ? undefined
      : getPlatformTileStyles(config.color);

  return (
    <>
      <HintTooltip label={t("linkEditor.changeIcon")}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#0a0a10]"
          style={tileStyle}
          aria-label={t("linkEditor.changeIcon")}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-white/50" />
          ) : link.iconUrl ? (
            <CustomLinkIcon iconUrl={link.iconUrl} color="#a855f7" sizeClass="h-6 w-6" />
          ) : isCustom ? (
            <Globe className="h-4 w-4 text-white/55" />
          ) : (
            <span className="flex h-4 w-4 items-center justify-center [&_svg]:h-full [&_svg]:w-full">
              <PlatformIcon platform={link.platform} />
            </span>
          )}
        </button>
      </HintTooltip>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR.linkIcon}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </>
  );
}

function LinkCard({
  link,
  hidden,
  onUpdate,
  onRemove,
  onToggleHidden,
}: {
  link: SocialLink;
  hidden: boolean;
  onUpdate: (partial: Partial<SocialLink>) => void;
  onRemove: () => void;
  onToggleHidden: () => void;
}) {
  const { t, tVars } = useI18n();
  const [editing, setEditing] = useState(!link.url.trim());
  const config = PLATFORM_CONFIG[link.platform];
  const isCustom = link.platform === "custom";
  const displayLabel = isCustom ? link.label || config.label : config.label;
  const hasUrl = link.url.trim().length > 0;

  return (
    <div
      className={`rounded-xl border bg-[#12121a] p-3 ${
        isSocialLinkActive(link) ? "border-white/[0.08]" : "border-amber-500/35"
      } ${hidden ? "opacity-55" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-white">{displayLabel}</p>
        <div className="flex shrink-0 items-center gap-1">
          <HintTooltip label={t("linkEditor.editLink")}>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className={`rounded-lg p-1.5 transition-colors ${
                editing
                  ? "bg-white/10 text-white"
                  : "text-white/45 hover:bg-white/5 hover:text-white"
              }`}
              aria-label={t("linkEditor.editLink")}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </HintTooltip>
          <HintTooltip label={hidden ? t("linkEditor.showLink") : t("linkEditor.hideLink")}>
            <button
              type="button"
              onClick={onToggleHidden}
              disabled={!hasUrl}
              className="rounded-lg p-1.5 text-white/45 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
              aria-label={hidden ? t("linkEditor.showLink") : t("linkEditor.hideLink")}
            >
              {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </HintTooltip>
          <HintTooltip label={tVars("linkEditor.remove", { label: config.label })}>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg bg-red-500/15 p-1.5 text-red-400/80 transition-colors hover:bg-red-500/25 hover:text-red-400"
              aria-label={tVars("linkEditor.remove", { label: config.label })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </HintTooltip>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#0a0a10] px-2 py-1.5">
        <GripVertical className="h-4 w-4 shrink-0 text-white/15" aria-hidden />
        <LinkIconButton link={link} onUploaded={(iconUrl) => onUpdate({ iconUrl })} />
        <input
          type="text"
          value={link.url}
          onChange={(e) =>
            onUpdate({
              url: sanitizeSocialLinkInput(link.platform, e.target.value),
            })
          }
          placeholder={getPlatformUrlPlaceholder(link.platform)}
          className="min-w-0 flex-1 bg-transparent text-sm text-white/85 outline-none placeholder:text-white/25"
          aria-label={
            isPlatformUsernameField(link.platform)
              ? tVars("linkEditor.usernameFor", { label: config.label })
              : tVars("linkEditor.linkFor", { label: config.label })
          }
        />
      </div>

      {editing ? (
        <div className="mt-2 space-y-2 border-t border-white/[0.06] pt-2">
          <input
            type="text"
            value={link.label ?? ""}
            onChange={(e) => onUpdate({ label: e.target.value || undefined })}
            placeholder={t("linkEditor.visibleName")}
            className="input-field py-1.5 text-xs"
            aria-label={t("linkEditor.visibleName")}
          />
          {isPlatformUsernameField(link.platform) ? (
            <p className="text-[10px] text-white/35">{t("linkEditor.usernameHint")}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function LinkEditor({
  links,
  linkHidden = {},
  section = "all",
  onChange,
  onLinkHiddenChange,
}: Props) {
  const { t, tVars } = useI18n();
  const usedPlatforms = new Set(
    links.filter((l) => l.platform !== "custom").map((l) => l.platform)
  );

  const activeCount = countActiveSocialLinks(links);
  const activePlatformCount = countActivePlatformLinks(links);
  const activeCustomCount = countActiveCustomLinks(links);
  const draftCount = countDraftSocialLinks(links);
  const atTotalLimit = !canAddSocialLink(links);
  const atCustomLimit = !canAddCustomLink(links);
  const atPlatformLimit = !canAddPlatformLink(links);
  const atPlatformCountLimit = activePlatformCount >= MAX_PLATFORM_LINKS;
  const atCustomCountLimit = activeCustomCount >= MAX_CUSTOM_LINKS;

  const availablePlatforms = LINK_PICKER_PLATFORMS.filter(
    (platform) => !usedPlatforms.has(platform)
  );

  const insertLink = (platform: SocialPlatform) => {
    if (!canAddLink(links, platform)) return;
    const emptyIndex = links.findIndex((link) => !link.url.trim());
    if (emptyIndex >= 0) {
      const next = [...links];
      next[emptyIndex] = { ...createEmptyLink(platform), id: next[emptyIndex].id };
      onChange(next);
      return;
    }
    if (atTotalLimit) return;
    onChange([...links, createEmptyLink(platform)]);
  };

  const addLink = (platform: SocialPlatform) => {
    if (usedPlatforms.has(platform)) return;
    insertLink(platform);
  };

  const toggleHidden = (linkId: string) => {
    const next = { ...linkHidden };
    if (next[linkId]) delete next[linkId];
    else next[linkId] = true;
    onLinkHiddenChange(next);
  };

  const showPlatformPicker = !atPlatformLimit && availablePlatforms.length > 0;

  const showNetworks = section === "all" || section === "networks";
  const showAdded = section === "all" || section === "added";

  return (
    <div className="space-y-5">
      {showNetworks || showAdded ? (
      <p className="text-xs">
        <span className={atPlatformCountLimit ? "text-amber-300/90" : "text-white/40"}>
          {tVars("linkEditor.platformCount", {
            count: activePlatformCount,
            max: MAX_PLATFORM_LINKS,
          })}
        </span>
        <span className={atCustomCountLimit ? "text-amber-300/90" : "text-white/30"}>
          {tVars("linkEditor.customCount", {
            count: activeCustomCount,
            max: MAX_CUSTOM_LINKS,
          })}
        </span>
        {!atPlatformCountLimit && !atCustomCountLimit && (
          <span className="text-white/25">
            {tVars("linkEditor.totalCount", {
              count: activeCount,
              max: MAX_PROFILE_LINKS,
            })}
          </span>
        )}
        {draftCount > 0 && (
          <span className="text-white/30">{tVars("linkEditor.draftHint", { drafts: draftCount })}</span>
        )}
      </p>
      ) : null}

      {showNetworks && (showPlatformPicker || !atCustomLimit) ? (
        <section className="rounded-2xl border border-white/[0.08] bg-[#12121a] p-4">
          <div className="mb-1 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">{t("linkEditor.pickerTitle")}</h3>
          </div>
          <p className="mb-3 text-xs text-white/45">{t("linkEditor.pickerSubtitle")}</p>

          {showPlatformPicker ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
              {availablePlatforms.map((platform) => (
                <PlatformBrandTile
                  key={platform}
                  platform={platform}
                  size="sm"
                  fill
                  hintDescription={t("linkEditor.holdTapToAdd")}
                  onClick={() => addLink(platform)}
                />
              ))}
            </div>
          ) : null}

          {!atCustomLimit ? (
            <HintTooltip
              label={t("linkEditor.customTitle")}
              description={t("linkEditor.customUrlDescription")}
            >
              <button
                type="button"
                onClick={() => insertLink("custom")}
                className="mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-3 text-left transition-all hover:border-purple-500/35 hover:bg-purple-500/10 sm:max-w-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/55">
                  <Globe className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white">{t("linkEditor.customTitle")}</span>
                  <span className="mt-0.5 block text-xs text-white/40">{t("linkEditor.customUrlDescription")}</span>
                </span>
              </button>
            </HintTooltip>
          ) : null}
        </section>
      ) : null}

      {showAdded && links.length > 0 ? (
        <section className="space-y-2.5">
          <h3 className="text-sm font-medium text-white/70">{t("linkEditor.addedLinksTitle")}</h3>
          <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                hidden={Boolean(linkHidden[link.id])}
                onUpdate={(partial) =>
                  onChange(links.map((l) => (l.id === link.id ? { ...l, ...partial } : l)))
                }
                onRemove={() => onChange(links.filter((l) => l.id !== link.id))}
                onToggleHidden={() => toggleHidden(link.id)}
              />
            ))}
          </div>
        </section>
      ) : showAdded ? (
        <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-6 text-center text-sm text-white/40">
          {t("linkEditor.empty")}
        </p>
      ) : null}
    </div>
  );
}
