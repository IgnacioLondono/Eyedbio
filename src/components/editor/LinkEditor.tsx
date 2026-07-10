"use client";

import { useRef, useState } from "react";
import { Globe, GripVertical, Link2, Loader2, Pencil, Trash2 } from "lucide-react";
import { SocialLink, SocialPlatform } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/config/platforms";
import { PLATFORM_CATEGORIES, getPlatformUrlPlaceholder } from "@/lib/config/platform-categories";
import { isPlatformUsernameField, sanitizeSocialLinkInput } from "@/lib/social-link-utils";
import CustomLinkIcon from "@/components/profile/CustomLinkIcon";
import { PlatformIcon } from "@/components/shared/PlatformIcons";
import PlatformBrandTile, { getPlatformTileStyles } from "@/components/editor/PlatformBrandTile";
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
  onChange: (links: SocialLink[]) => void;
}

function LinkIconPreview({
  link,
  onUploaded,
  onClear,
}: {
  link: SocialLink;
  onUploaded: (url: string) => void;
  onClear: () => void;
}) {
  const { t, tVars } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const config = PLATFORM_CONFIG[link.platform];
  const isCustom = link.platform === "custom";

  const handleFile = async (file: File) => {
    const validation = getUploadValidationError("linkIcon", file);
    if (validation) {
      setError(
        validation.code === "size"
          ? tVars("fileUpload.fileTooLarge", { limit: validation.limitMb })
          : t("fileUpload.fileTypeNotAllowed")
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "linkIcon");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("linkEditor.uploadError"));

      onUploaded(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("linkEditor.uploadError"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const tileStyle =
    link.iconUrl
      ? undefined
      : isCustom
        ? {
            backgroundColor: "rgba(255,255,255,0.06)",
            borderColor: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.55)",
          }
        : getPlatformTileStyles(config.color);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50"
        style={tileStyle}
        aria-label={link.iconUrl ? t("linkEditor.changeIcon") : t("linkEditor.uploadIcon")}
        title={link.iconUrl ? t("linkEditor.changeIcon") : t("linkEditor.uploadIcon")}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-white/50" />
        ) : link.iconUrl ? (
          <CustomLinkIcon iconUrl={link.iconUrl} color="#a855f7" sizeClass="h-8 w-8" />
        ) : isCustom ? (
          <Globe className="h-6 w-6 text-white/55" />
        ) : (
          <span className="[&_svg]:h-6 [&_svg]:w-6" style={{ color: config.color }}>
            <PlatformIcon platform={link.platform} />
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
          <Pencil className="h-4 w-4 text-white" />
        </span>
      </button>
      {link.iconUrl ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute -right-1 -top-1 rounded-full bg-[#12121a] p-0.5 text-[9px] text-red-400/80 hover:text-red-400"
          aria-label={t("linkEditor.removeIcon")}
        >
          ×
        </button>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR.linkIcon}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error ? <p className="absolute left-0 top-full mt-1 w-32 text-[9px] text-red-400">{error}</p> : null}
    </div>
  );
}

function LinkRow({
  link,
  onUpdate,
  onRemove,
}: {
  link: SocialLink;
  onUpdate: (partial: Partial<SocialLink>) => void;
  onRemove: () => void;
}) {
  const { t, tVars } = useI18n();
  const config = PLATFORM_CONFIG[link.platform];
  const isCustom = link.platform === "custom";
  const displayLabel = isCustom ? link.label || config.label : config.label;

  return (
    <div
      className={`rounded-xl border bg-[#12121a] p-3 sm:p-4 ${
        isSocialLinkActive(link) ? "border-white/[0.08]" : "border-amber-500/35"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 sm:hidden">
        <p className="truncate text-sm font-medium text-white">{displayLabel}</p>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-1.5 text-red-400/60 transition-colors hover:bg-red-400/10 hover:text-red-400"
          aria-label={tVars("linkEditor.remove", { label: config.label })}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <GripVertical className="hidden h-5 w-5 shrink-0 text-white/15 sm:block" aria-hidden />

        <LinkIconPreview
          link={link}
          onUploaded={(iconUrl) => onUpdate({ iconUrl })}
          onClear={() => onUpdate({ iconUrl: undefined })}
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="hidden items-center justify-between gap-2 sm:flex">
            <p className="truncate text-sm font-medium text-white">{displayLabel}</p>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg p-1.5 text-red-400/60 transition-colors hover:bg-red-400/10 hover:text-red-400"
              aria-label={tVars("linkEditor.remove", { label: config.label })}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <input
            type="text"
            value={link.label ?? ""}
            onChange={(e) => onUpdate({ label: e.target.value || undefined })}
            placeholder={t("linkEditor.visibleName")}
            className="input-field py-1.5 text-xs"
            aria-label={t("linkEditor.visibleName")}
          />

          <input
            type="text"
            value={link.url}
            onChange={(e) =>
              onUpdate({
                url: sanitizeSocialLinkInput(link.platform, e.target.value),
              })
            }
            placeholder={getPlatformUrlPlaceholder(link.platform)}
            className="input-field text-sm"
            aria-label={
              isPlatformUsernameField(link.platform)
                ? tVars("linkEditor.usernameFor", { label: config.label })
                : tVars("linkEditor.linkFor", { label: config.label })
            }
          />

          {isPlatformUsernameField(link.platform) ? (
            <p className="text-[10px] text-white/35">{t("linkEditor.usernameHint")}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function LinkEditor({ links, onChange }: Props) {
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

  const availablePlatforms = PLATFORM_CATEGORIES.flatMap((category) => category.platforms).filter(
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

  const addCustomLink = () => {
    insertLink("custom");
  };

  const updateLink = (id: string, partial: Partial<SocialLink>) => {
    onChange(links.map((l) => (l.id === id ? { ...l, ...partial } : l)));
  };

  const removeLink = (id: string) => {
    onChange(links.filter((l) => l.id !== id));
  };

  const showPlatformPicker = !atPlatformLimit && availablePlatforms.length > 0;

  return (
    <div className="space-y-6">
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
        {atPlatformCountLimit && !atTotalLimit && (
          <span className="text-amber-300/90">{t("linkEditor.platformLimitReached")}</span>
        )}
        {atTotalLimit && activeCount >= MAX_PROFILE_LINKS && (
          <span className="text-amber-300/90">{t("linkEditor.limitReached")}</span>
        )}
      </p>

      {showPlatformPicker || !atCustomLimit ? (
        <section className="rounded-2xl border border-white/[0.08] bg-[#12121a] p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-purple-400" />
            <h3 className="text-base font-semibold text-white">{t("linkEditor.pickerTitle")}</h3>
          </div>
          <p className="mb-4 text-sm text-white/45">{t("linkEditor.pickerSubtitle")}</p>

          {showPlatformPicker ? (
            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
              {availablePlatforms.map((platform) => (
                <PlatformBrandTile
                  key={platform}
                  platform={platform}
                  size="md"
                  onClick={() => addLink(platform)}
                />
              ))}

              {!atCustomLimit ? (
                <button
                  type="button"
                  onClick={addCustomLink}
                  className="group col-span-2 flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-3 text-center transition-all hover:border-purple-500/35 hover:bg-purple-500/10 sm:min-h-[96px]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/55 transition-colors group-hover:text-white">
                    <Globe className="h-6 w-6" />
                  </span>
                  <span className="block text-xs font-medium text-white">{t("linkEditor.customTitle")}</span>
                  <span className="block text-[10px] leading-snug text-white/40">
                    {t("linkEditor.customUrlDescription")}
                  </span>
                </button>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={addCustomLink}
              disabled={atCustomLimit}
              className="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-left transition-all hover:border-purple-500/35 hover:bg-purple-500/10 disabled:pointer-events-none disabled:opacity-40"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                <Globe className="h-6 w-6 text-white/55" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">{t("linkEditor.customTitle")}</span>
                <span className="mt-0.5 block text-xs text-white/40">
                  {atCustomLimit && activeCustomCount >= MAX_CUSTOM_LINKS
                    ? t("linkEditor.customLimitReached")
                    : t("linkEditor.customUrlDescription")}
                </span>
              </span>
            </button>
          )}
        </section>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-white/70">{t("linkEditor.addedLinksTitle")}</h3>

        {links.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-8 text-center text-sm text-white/40">
            {t("linkEditor.empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                onUpdate={(partial) => updateLink(link.id, partial)}
                onRemove={() => removeLink(link.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
