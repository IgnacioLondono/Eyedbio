"use client";

import { motion, type MotionProps } from "framer-motion";
import { Globe } from "lucide-react";
import { SocialLink, SocialPlatform, ProfileSettings } from "@/types/profile";
import { PLATFORM_CONFIG } from "@/lib/config/platforms";
import { PlatformIcon } from "@/components/shared/PlatformIcons";
import CustomLinkIcon from "@/components/profile/CustomLinkIcon";
import { hexToRgba } from "@/lib/config/color-utils";
import type { LinkStyle } from "@/types/profile";
import SocialLinks from "@/components/profile/SocialLinks";
import { ExternalLinkConfirmProvider, useExternalLinkConfirm } from "@/components/profile/ExternalLinkConfirmProvider";
import { t as translate } from "@/lib/i18n";
import { getSocialLinkTitle, isSocialLinkActive } from "@/lib/social-link-utils";
import { useSocialLinkAction } from "@/components/profile-card/useSocialLinkAction";
import {
  getIconContainerStyle,
  getIconLinkWrapperClass,
  getIconShapeClass,
  getLinkIconColor,
  getPlatformLinkColor,
  isPlainLinkIcons,
  resolveIconStyle,
} from "@/lib/config/icon-style-config";

interface Props {
  links: SocialLink[];
  linkStyle: LinkStyle;
  settings: Pick<
    ProfileSettings,
    | "accentColor"
    | "glowIcons"
    | "monochromeIcons"
    | "iconColorMode"
    | "iconColor"
    | "customLinkIconColor"
    | "iconBackgroundColor"
    | "iconShape"
  >;
  textColor: string;
  compact?: boolean;
  locale?: "es" | "en";
  mutedColor?: string;
}

function LinkIcon({
  link,
  color,
  sizeClass,
  glowIcons,
}: {
  link: SocialLink;
  color: string;
  sizeClass: string;
  glowIcons?: boolean;
}) {
  if (link.iconUrl) {
    return (
      <CustomLinkIcon
        iconUrl={link.iconUrl}
        color={color}
        sizeClass={sizeClass}
        glowIcons={glowIcons}
      />
    );
  }
  if (link.platform === "custom") {
    return <Globe className={`${sizeClass} text-white/70`} style={{ color }} />;
  }
  return <PlatformIcon platform={link.platform as SocialPlatform} />;
}

function EmptyLinks({ mutedColor, locale = "es" }: { mutedColor: string; locale?: "es" | "en" }) {
  return (
    <p className="text-sm italic text-center" style={{ color: mutedColor }}>
      {translate(locale, "profile.noLinks")}
    </p>
  );
}

function ProfileLinkWrap({
  link,
  locale,
  className,
  style,
  motionProps,
  children,
}: {
  link: SocialLink;
  locale: "es" | "en";
  className: string;
  style?: React.CSSProperties;
  motionProps?: MotionProps;
  children: React.ReactNode;
}) {
  const copyHint = translate(locale, "profile.copyUsernameHint");
  const copiedLabel = translate(locale, "profile.usernameCopied");
  const { requestVisit } = useExternalLinkConfirm();
  const { copyOnly, href, title, copied, activate } = useSocialLinkAction(link);
  const tooltip = copyOnly
    ? copied
      ? copiedLabel
      : `${title} · ${copyHint}`
    : title;

  if (copyOnly) {
    if (motionProps) {
      return (
        <motion.button
          type="button"
          onClick={() => void activate()}
          title={tooltip}
          aria-label={tooltip}
          className={`${className} cursor-copy`}
          style={style}
          {...motionProps}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => void activate()}
        title={tooltip}
        aria-label={tooltip}
        className={`${className} cursor-copy`}
        style={style}
      >
        {children}
      </button>
    );
  }

  if (motionProps) {
    return (
      <motion.button
        type="button"
        onClick={() => href && requestVisit(href)}
        title={title}
        aria-label={title}
        className={className}
        style={style}
        {...motionProps}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => href && requestVisit(href)}
      title={title}
      aria-label={title}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}

function PillsLinks({
  links,
  settings,
  textColor,
  compact,
  locale = "es",
  mutedColor,
}: Omit<Props, "linkStyle">) {
  const iconStyle = resolveIconStyle(settings as ProfileSettings);
  const visible = links.filter(isSocialLinkActive);
  if (visible.length === 0) return <EmptyLinks mutedColor={mutedColor ?? "rgba(255,255,255,0.3)"} locale={locale} />;

  const iconShapeClass = getIconShapeClass(iconStyle.iconShape);
  const containerStyle = getIconContainerStyle(iconStyle);
  const plainIcons = isPlainLinkIcons(iconStyle.iconShape);

  return (
    <div className={`w-full flex flex-col ${compact ? "gap-1" : "gap-1.5"}`}>
      {visible.map((link, i) => {
        const config = PLATFORM_CONFIG[link.platform];
        const color = getPlatformLinkColor(iconStyle, config.color);
        const iconColor = getLinkIconColor(iconStyle, config.color, Boolean(link.iconUrl));
        const title = getSocialLinkTitle(link);
        const iconSize = compact ? "w-3.5 h-3.5" : "w-4 h-4";

        return (
          <ProfileLinkWrap
            key={link.id}
            link={link}
            locale={locale}
            motionProps={
              compact
                ? undefined
                : {
                    initial: { opacity: 0, x: -6 },
                    animate: { opacity: 1, x: 0 },
                    transition: { delay: 0.2 + i * 0.04 },
                    whileHover: { scale: 1.01 },
                    whileTap: { scale: 0.98 },
                  }
            }
            className={`flex items-center gap-2.5 w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${
              compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"
            }`}
            style={{
              borderLeftColor: color,
              borderLeftWidth: 2,
            }}
          >
            <span
              className={
                plainIcons
                  ? "flex shrink-0 items-center justify-center"
                  : `flex shrink-0 items-center justify-center ${compact ? "w-7 h-7" : "w-8 h-8"} ${iconShapeClass} bg-white/5`
              }
              style={{
                color: link.iconUrl ? undefined : color,
                filter: iconStyle.glowIcons ? `drop-shadow(0 0 6px ${color})` : undefined,
                ...(plainIcons ? {} : containerStyle),
              }}
            >
              <LinkIcon
                link={link}
                color={iconColor}
                sizeClass={iconSize}
                glowIcons={iconStyle.glowIcons}
              />
            </span>
            <span className="font-medium truncate" style={{ color: textColor }}>
              {title}
            </span>
          </ProfileLinkWrap>
        );
      })}
    </div>
  );
}

function RowLinks({
  links,
  settings,
  compact,
  locale = "es",
  mutedColor,
}: Omit<Props, "linkStyle" | "textColor">) {
  const iconStyle = resolveIconStyle(settings as ProfileSettings);
  const visible = links.filter(isSocialLinkActive);
  if (visible.length === 0) return <EmptyLinks mutedColor={mutedColor ?? "rgba(255,255,255,0.3)"} locale={locale} />;

  const btn = compact ? "w-8 h-8" : "w-10 h-10";
  const icon = compact ? "w-4 h-4" : "w-5 h-5";
  const plainIcon = compact ? "w-5 h-5" : "w-6 h-6";
  const containerStyle = getIconContainerStyle(iconStyle);

  return (
    <div className={`flex flex-wrap justify-center gap-2 ${compact ? "" : "gap-2.5"}`}>
      {visible.map((link) => {
        const config = PLATFORM_CONFIG[link.platform];
        const color = getPlatformLinkColor(iconStyle, config.color);
        const iconColor = getLinkIconColor(iconStyle, config.color, Boolean(link.iconUrl));

        return (
          <ProfileLinkWrap
            key={link.id}
            link={link}
            locale={locale}
            className={getIconLinkWrapperClass(iconStyle, btn, "row")}
            style={{
              color: link.iconUrl ? undefined : color,
              filter: iconStyle.glowIcons ? `drop-shadow(0 0 6px ${color})` : undefined,
              ...containerStyle,
            }}
          >
            <LinkIcon
              link={link}
              color={iconColor}
              sizeClass={isPlainLinkIcons(iconStyle.iconShape) ? plainIcon : icon}
              glowIcons={iconStyle.glowIcons}
            />
          </ProfileLinkWrap>
        );
      })}
    </div>
  );
}

function ChipsLinks({
  links,
  settings,
  textColor,
  compact,
  locale = "es",
  mutedColor,
}: Omit<Props, "linkStyle">) {
  const iconStyle = resolveIconStyle(settings as ProfileSettings);
  const visible = links.filter(isSocialLinkActive);
  if (visible.length === 0) return <EmptyLinks mutedColor={mutedColor ?? "rgba(255,255,255,0.3)"} locale={locale} />;

  return (
    <div className={`flex flex-wrap justify-center ${compact ? "gap-1.5" : "gap-2"}`}>
      {visible.map((link) => {
        const config = PLATFORM_CONFIG[link.platform];
        const color = getPlatformLinkColor(iconStyle, config.color);
        const iconColor = getLinkIconColor(iconStyle, config.color, Boolean(link.iconUrl));
        const title = getSocialLinkTitle(link);
        const iconSize = compact ? "w-3.5 h-3.5" : "w-4 h-4";

        return (
          <ProfileLinkWrap
            key={link.id}
            link={link}
            locale={locale}
            className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 ${
              compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
            }`}
            style={{
              color: textColor,
              filter: iconStyle.glowIcons ? `drop-shadow(0 0 4px ${hexToRgba(color, 0.4)})` : undefined,
            }}
          >
            <span style={{ color: link.iconUrl ? undefined : color }}>
              <LinkIcon
                link={link}
                color={iconColor}
                sizeClass={iconSize}
                glowIcons={iconStyle.glowIcons}
              />
            </span>
            <span className="truncate max-w-[100px]">{title}</span>
          </ProfileLinkWrap>
        );
      })}
    </div>
  );
}

export default function ProfileLinksDisplay({
  links,
  linkStyle,
  settings,
  textColor,
  compact = false,
  locale = "es",
  mutedColor,
}: Props) {
  const muted = mutedColor ?? hexToRgba(textColor, 0.3);

  const content =
    linkStyle === "icons" ? (
      <SocialLinks
        links={links}
        settings={settings}
        compact={compact}
        mutedColor={muted}
        emptyLabel={translate(locale, "profile.noLinks")}
        copyHint={translate(locale, "profile.copyUsernameHint")}
        copiedLabel={translate(locale, "profile.usernameCopied")}
      />
    ) : linkStyle === "pills" ? (
      <PillsLinks
        links={links}
        settings={settings}
        textColor={textColor}
        compact={compact}
        locale={locale}
        mutedColor={muted}
      />
    ) : linkStyle === "row" ? (
      <RowLinks
        links={links}
        settings={settings}
        compact={compact}
        locale={locale}
        mutedColor={muted}
      />
    ) : (
      <ChipsLinks
        links={links}
        settings={settings}
        textColor={textColor}
        compact={compact}
        locale={locale}
        mutedColor={muted}
      />
    );

  return <ExternalLinkConfirmProvider locale={locale}>{content}</ExternalLinkConfirmProvider>;
}
