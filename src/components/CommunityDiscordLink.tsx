import { DiscordIcon } from "@/components/PlatformIcons";
import {
  COMMUNITY_BOT_LABEL,
  COMMUNITY_BOT_URL,
  COMMUNITY_DISCORD_LABEL,
  COMMUNITY_DISCORD_URL,
} from "@/lib/community";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

interface Props {
  variant?: "button" | "banner" | "header";
  className?: string;
}

const headerLinkClass =
  "inline-flex items-center justify-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs text-white/60 hover:text-white border border-white/10 rounded-lg transition-colors shrink-0";

export default function CommunityDiscordLink({
  variant = "button",
  className = "",
}: Props) {
  const site = useSiteSettings();
  if (!site.communityDiscordEnabled) return null;

  if (variant === "header") {
    return (
      <div className={`inline-flex items-center gap-1 sm:gap-2 ${className}`}>
        <a
          href={COMMUNITY_BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          title={COMMUNITY_BOT_LABEL}
          aria-label={COMMUNITY_BOT_LABEL}
          className={`${headerLinkClass} hidden md:inline-flex hover:bg-purple-500/10 hover:border-purple-500/30`}
        >
          <span className="font-medium text-purple-300/90">{COMMUNITY_BOT_LABEL}</span>
        </a>
        <a
          href={COMMUNITY_DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Discord"
          aria-label="Discord"
          className={`${headerLinkClass} hover:bg-[#5865F2]/10 hover:border-[#5865F2]/30`}
        >
          <DiscordIcon />
          <span className="hidden sm:inline">Discord</span>
        </a>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <section className={`py-16 px-6 ${className}`}>
        <div className="max-w-3xl mx-auto rounded-2xl border border-[#5865F2]/25 bg-[#5865F2]/10 p-8 md:p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#5865F2]/20 text-[#5865F2] mb-4">
            <DiscordIcon />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Únete a {COMMUNITY_DISCORD_LABEL}
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-lg mx-auto mb-6 leading-relaxed">
            Comunidad en Discord para usuarios de Eyed.bio: soporte, novedades,
            ideas y feedback directo con el equipo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={COMMUNITY_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl transition-colors shadow-lg shadow-purple-500/25"
            >
              {COMMUNITY_BOT_LABEL}
            </a>
            <a
              href={COMMUNITY_DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-xl transition-colors shadow-lg shadow-[#5865F2]/25"
            >
              <DiscordIcon />
              Entrar al Discord
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <a
        href={COMMUNITY_BOT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-purple-500/30 bg-purple-500/10 text-white rounded-xl hover:bg-purple-500/20 transition-colors"
      >
        {COMMUNITY_BOT_LABEL}
      </a>
      <a
        href={COMMUNITY_DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-[#5865F2]/30 bg-[#5865F2]/10 text-white rounded-xl hover:bg-[#5865F2]/20 transition-colors"
      >
        <DiscordIcon />
        Discord de {COMMUNITY_DISCORD_LABEL}
      </a>
    </div>
  );
}
