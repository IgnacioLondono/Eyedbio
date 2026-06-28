"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { Check, Download, Link2, Share2, Smartphone, X, type LucideIcon } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  TikTokIcon,
  TwitterIcon,
  WhatsAppIcon,
} from "@/components/shared/PlatformIcons";
import { useI18n } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n";

interface Props {
  username: string;
  displayName?: string;
  variant?: "floating" | "inline" | "card";
}

type ShareChannel = "whatsapp" | "twitter" | "telegram" | "facebook" | "story";

export default function ShareProfileButton({
  username,
  displayName,
  variant = "floating",
}: Props) {
  const { t, locale } = useI18n();
  const shareMsg = getMessages(locale).share;

  const CHANNELS: {
    id: ShareChannel;
    label: string;
    hint?: string;
    Icon: ComponentType | LucideIcon;
    color: string;
  }[] = [
    {
      id: "story",
      label: shareMsg.stories,
      hint: shareMsg.storiesHint,
      Icon: Smartphone,
      color: "#a855f7",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      Icon: WhatsAppIcon,
      color: "#25D366",
    },
    {
      id: "twitter",
      label: "X",
      Icon: TwitterIcon,
      color: "#ffffff",
    },
    {
      id: "telegram",
      label: "Telegram",
      Icon: TelegramIcon,
      color: "#26A5E4",
    },
    {
      id: "facebook",
      label: "Facebook",
      Icon: FacebookIcon,
      color: "#1877F2",
    },
  ];
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storyHint, setStoryHint] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${username}`
      : `/${username}`;

  const storyImageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${username}/story-image`
      : `/${username}/story-image`;

  const shareTitle = displayName ? `${displayName} (@${username})` : `@${username}`;
  const shareText = t("share.shareText");

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [profileUrl]);

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=520");
    setOpen(false);
  };

  const shareToChannel = (channel: ShareChannel) => {
    const encodedUrl = encodeURIComponent(profileUrl);
    const encodedText = encodeURIComponent(`${shareText} ${profileUrl}`);

    switch (channel) {
      case "whatsapp":
        openShareWindow(`https://wa.me/?text=${encodedText}`);
        break;
      case "twitter":
        openShareWindow(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedUrl}`
        );
        break;
      case "telegram":
        openShareWindow(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`
        );
        break;
      case "facebook":
        openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
        break;
      case "story":
        void shareStoryImage();
        break;
    }
  };

  const shareStoryImage = async () => {
    setDownloading(true);
    try {
      const res = await fetch(storyImageUrl);
      if (!res.ok) throw new Error("fetch failed");

      const blob = await res.blob();
      const file = new File([blob], `${username}-eyed.bio-story.png`, {
        type: "image/png",
      });

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: shareText,
        });
        setOpen(false);
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${username}-eyed.bio-story.png`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);

      setStoryHint(true);
      setTimeout(() => setStoryHint(false), 5000);
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        window.open(storyImageUrl, "_blank", "noopener,noreferrer");
        setStoryHint(true);
        setTimeout(() => setStoryHint(false), 5000);
      }
    } finally {
      setDownloading(false);
    }
  };

  const nativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: profileUrl,
        });
        setOpen(false);
      } else {
        await copyLink();
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        await copyLink();
      }
    }
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerClass =
    variant === "inline"
      ? "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-medium transition-colors"
      : variant === "card"
        ? "p-2 rounded-lg bg-black/35 backdrop-blur-md border border-white/10 text-white/75 hover:text-white hover:bg-black/50 transition-colors"
        : "fixed top-6 left-6 z-30 flex items-center gap-2 px-3 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all text-xs font-medium";

  return (
    <>
      {variant === "inline" ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={triggerClass}
            aria-label={t("share.shareProfile")}
          >
            <Share2 className="w-4 h-4" />
            {t("share.shareProfile")}
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {copied ? t("share.linkCopied") : t("share.copyLink")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={triggerClass}
          aria-label={t("share.shareProfile")}
        >
          <Share2 className="w-4 h-4" />
          {variant === "floating" ? t("share.share") : null}
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("share.shareProfile")}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label={t("share.close")}
          />

          <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-[#12121a] border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-semibold text-white">{t("share.title")}</h3>
                <p className="text-xs text-white/40 mt-0.5 truncate max-w-[260px]">
                  eyed.bio/{username}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                aria-label={t("share.close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {CHANNELS.map(({ id, label, hint, Icon, color }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={id === "story" && downloading}
                    onClick={() => shareToChannel(id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-colors disabled:opacity-50"
                  >
                    <span
                      className="flex items-center justify-center w-12 h-12 rounded-full"
                      style={{ backgroundColor: `${color}22`, color }}
                    >
                      {id === "story" && downloading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Icon />
                      )}
                    </span>
                    <span className="text-xs font-medium text-white/90">{label}</span>
                    {hint && (
                      <span className="text-[10px] text-white/35 leading-tight text-center">
                        {hint}
                      </span>
                    )}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={copyLink}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-colors"
                >
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white">
                    {copied ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Link2 className="w-5 h-5" />
                    )}
                  </span>
                  <span className="text-xs font-medium text-white/90">
                    {copied ? t("share.copied") : t("share.link")}
                  </span>
                </button>
              </div>

              {storyHint && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Download className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-100/90 leading-relaxed">{t("share.storyHint")}</p>
                </div>
              )}

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-3">
                <p className="text-xs text-white/50 leading-relaxed">
                  <span className="text-white/70 font-medium">{t("share.storyHelp")}</span>{" "}
                  {t("share.storyHelpBody")}{" "}
                  <span className="text-white/70 font-medium">{t("share.chatsHelp")}</span>{" "}
                  {t("share.chatsHelpBody")}
                </p>
                <div className="flex items-center gap-3 text-white/30">
                  <InstagramIcon />
                  <TikTokIcon />
                  <WhatsAppIcon />
                </div>
              </div>

              {"share" in navigator && typeof navigator.share === "function" && (
                <button
                  type="button"
                  onClick={nativeShare}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  {t("share.moreOptions")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
