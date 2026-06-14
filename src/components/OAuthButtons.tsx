"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useI18n } from "@/components/LocaleProvider";
import type { OAuthProviderId } from "@/lib/oauth-providers";

const PROVIDER_META: Record<
  OAuthProviderId,
  { label: string; className: string; icon: React.ReactNode }
> = {
  google: {
    label: "Google",
    className:
      "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="#EA4335"
          d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 3.7 14.6 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1.1-.2-1.6H12z"
        />
        <path
          fill="#34A853"
          d="M3.3 7.7 6.6 10c.8-2.4 3-4.1 5.4-4.1 1.3 0 2.5.5 3.4 1.2l2.5-2.4C15.8 3.2 14 2.4 12 2.4 8 2.4 4.6 4.9 3.3 7.7z"
        />
        <path
          fill="#4A90E2"
          d="M12 21.2c2.4 0 4.4-.8 5.9-2.1l-2.7-2.2c-.7.5-1.7.9-3.2.9-2.4 0-4.5-1.6-5.2-3.9l-2.7 2.1c1.3 2.8 4.7 5.2 8.9 5.2z"
        />
        <path
          fill="#FBBC05"
          d="M21.8 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h5.5c-.2 1.2-1 2.2-2.1 2.9l2.7 2.2c1.6-1.5 2.7-3.7 2.7-6.7z"
        />
      </svg>
    ),
  },
  discord: {
    label: "Discord",
    className:
      "border-[#5865F2]/30 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 hover:border-[#5865F2]/50",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#5865F2]" aria-hidden>
        <path d="M20.3 4.4A17.7 17.7 0 0 0 15.5 3c-.2.4-.5 1-.7 1.4a16.3 16.3 0 0 0-4.6 0C9.9 4 9.6 3.4 9.4 3a17.8 17.8 0 0 0-4.8 1.4C2.5 8.5 1.8 12.4 2.2 16.2a17.9 17.9 0 0 0 5.4 2.8c.4-.6.8-1.2 1.1-1.9-.6-.2-1.2-.5-1.7-.9.1-.1.2-.2.3-.3 3.2 1.5 6.7 1.5 9.8 0 .1.1.2.2.3.3-.5.4-1.1.7-1.7.9.3.7.7 1.3 1.1 1.9a17.8 17.8 0 0 0 5.4-2.8c.5-4.4-.8-8.2-3.4-11.8ZM8.7 13.6c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
      </svg>
    ),
  },
  github: {
    label: "GitHub",
    className:
      "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden>
        <path d="M12 .5C5.65.5.5 5.76.5 12.24c0 5.18 3.29 9.57 7.86 11.12.58.11.79-.26.79-.57 0-.28-.01-1.02-.02-2-3.2.72-3.88-1.36-3.88-1.36-.53-1.37-1.3-1.74-1.3-1.74-1.06-.75.08-.73.08-.73 1.17.08 1.79 1.23 1.79 1.23 1.04 1.83 2.73 1.3 3.4.99.11-.78.41-1.3.74-1.6-2.56-.3-5.26-1.31-5.26-5.84 0-1.29.45-2.34 1.18-3.17-.12-.3-.51-1.53.11-3.18 0 0 .96-.31 3.15 1.21a10.4 10.4 0 0 1 5.52 0c2.19-1.52 3.15-1.21 3.15-1.21.62 1.65.23 2.88.11 3.18.73.83 1.18 1.88 1.18 3.17 0 4.54-2.71 5.53-5.29 5.82.42.37.79 1.1.79 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.21.69.8.57A10.53 10.53 0 0 0 23.5 12.24C23.5 5.76 18.35.5 12 .5Z" />
      </svg>
    ),
  },
  twitch: {
    label: "Twitch",
    className:
      "border-[#9146FF]/30 bg-[#9146FF]/10 hover:bg-[#9146FF]/20 hover:border-[#9146FF]/50",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#9146FF]" aria-hidden>
        <path d="M4 2 2 6.5v13h5v3l3-3h4l7-7V2H4Zm16 10.5-3 3h-4l-2.5 2.5V16H7V4h13v8.5ZM14 6h2v5h-2V6Zm-4 0h2v5h-2V6Z" />
      </svg>
    ),
  },
};

export default function OAuthButtons({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const { t } = useI18n();
  const [providers, setProviders] = useState<OAuthProviderId[]>([]);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProviderId | null>(null);

  useEffect(() => {
    fetch("/api/auth/oauth-providers")
      .then((res) => (res.ok ? res.json() : { providers: [] }))
      .then((data: { providers?: OAuthProviderId[] }) => {
        setProviders(Array.isArray(data.providers) ? data.providers : []);
      })
      .catch(() => setProviders([]));
  }, []);

  if (providers.length === 0) return null;

  const handleSignIn = async (provider: OAuthProviderId) => {
    setLoadingProvider(provider);
    try {
      await signIn(provider, { callbackUrl });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-wider text-white/35">
          {t("auth.oauthDivider")}
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {providers.map((provider) => {
          const meta = PROVIDER_META[provider];
          const busy = loadingProvider === provider;

          return (
            <button
              key={provider}
              type="button"
              disabled={Boolean(loadingProvider)}
              onClick={() => void handleSignIn(provider)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${meta.className}`}
            >
              {meta.icon}
              <span>{busy ? t("auth.oauthRedirecting") : meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
