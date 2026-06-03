import { DiscordIcon } from "@/components/PlatformIcons";
import {
  COMMUNITY_DISCORD_LABEL,
  COMMUNITY_DISCORD_URL,
} from "@/lib/community";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

interface Props {
  variant?: "button" | "banner" | "header";
  className?: string;
}

export default function CommunityDiscordLink({
  variant = "button",
  className = "",
}: Props) {
  const site = useSiteSettings();
  if (!site.communityDiscordEnabled) return null;

  if (variant === "header") {
    return (
      <a
        href={COMMUNITY_DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/10 rounded-lg hover:bg-[#5865F2]/10 hover:border-[#5865F2]/30 transition-colors ${className}`}
      >
        <DiscordIcon />
        <span className="hidden sm:inline">Discord</span>
      </a>
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
      </section>
    );
  }

  return (
    <a
      href={COMMUNITY_DISCORD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-[#5865F2]/30 bg-[#5865F2]/10 text-white rounded-xl hover:bg-[#5865F2]/20 transition-colors ${className}`}
    >
      <DiscordIcon />
      Discord de {COMMUNITY_DISCORD_LABEL}
    </a>
  );
}
