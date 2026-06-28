"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Unlink } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/components/LocaleProvider";
import { COMMUNITY_DISCORD_URL } from "@/lib/community";

interface DiscordStatus {
  available: boolean;
  linked: boolean;
  discordUserId: string | null;
}

interface Props {
  /** ID ya guardado en el perfil local; evita re-sincronizar en bucle. */
  currentDiscordUserId?: string;
  onLinked: (discordUserId: string) => void;
  onUnlinked: () => void;
}

const DISCORD_ERROR_KEYS: Record<string, string> = {
  unavailable: "dashboard.discordLinkUnavailable",
  invalid: "dashboard.discordLinkErrorInvalid",
  session: "dashboard.discordLinkErrorSession",
  already_linked: "dashboard.discordLinkErrorAlreadyLinked",
  failed: "dashboard.discordLinkError",
};

export default function DiscordAccountLink({
  currentDiscordUserId = "",
  onLinked,
  onUnlinked,
}: Props) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const onLinkedRef = useRef(onLinked);
  const onUnlinkedRef = useRef(onUnlinked);
  const [status, setStatus] = useState<DiscordStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onLinkedRef.current = onLinked;
    onUnlinkedRef.current = onUnlinked;
  }, [onLinked, onUnlinked]);

  const profileIdRef = useRef(currentDiscordUserId);
  profileIdRef.current = currentDiscordUserId;
  const hasLoadedOnceRef = useRef(false);

  const load = useCallback(async (silent = false) => {
    const showSpinner = !silent && !hasLoadedOnceRef.current;
    if (showSpinner) setLoading(true);
    if (!silent) setError("");
    try {
      const res = await fetch("/api/account/discord");
      const data = (await res.json()) as DiscordStatus & { error?: string };
      if (!res.ok) throw new Error(data.error ?? t("dashboard.discordLinkError"));

      setStatus(data);

      const apiId = data.discordUserId?.trim() ?? "";
      const profileId = profileIdRef.current.trim();
      if (apiId && apiId !== profileId) {
        onLinkedRef.current(apiId);
      } else if (!apiId && profileId) {
        onUnlinkedRef.current();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("dashboard.discordLinkError"));
      if (!silent) setStatus(null);
    } finally {
      hasLoadedOnceRef.current = true;
      if (showSpinner) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load(false);
  }, [load]);

  useEffect(() => {
    if (searchParams.get("discordLinked") === "1") {
      void load(true);
    }
  }, [load, searchParams]);

  useEffect(() => {
    const code = searchParams.get("discordError");
    if (!code) return;
    const key = DISCORD_ERROR_KEYS[code] ?? "dashboard.discordLinkError";
    setError(t(key));
  }, [searchParams, t]);

  const unlink = async () => {
    if (!window.confirm(t("dashboard.discordUnlinkConfirm"))) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account/discord", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("dashboard.discordLinkError"));

      onUnlinked();
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("dashboard.discordLinkError"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/40 py-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {t("common.loading")}
      </div>
    );
  }

  if (!status?.available) {
    return (
      <p className="text-xs text-white/40 leading-relaxed">{t("dashboard.discordLinkUnavailable")}</p>
    );
  }

  return (
    <div className="space-y-3">
      {status.linked && status.discordUserId ? (
        <div className="rounded-xl border border-[#5865F2]/25 bg-[#5865F2]/10 px-4 py-3">
          <p className="text-sm font-medium text-white">{t("dashboard.discordLinkedTitle")}</p>
          <p className="text-xs text-white/45 mt-1 font-mono">{status.discordUserId}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void unlink()}
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-white/55 hover:text-white disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Unlink className="w-3.5 h-3.5" />
            )}
            {t("dashboard.discordUnlink")}
          </button>
        </div>
      ) : (
        <a
          href="/api/account/discord/connect"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#5865F2]/35 bg-[#5865F2]/15 hover:bg-[#5865F2]/25 text-sm font-medium text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#5865F2]" aria-hidden>
            <path d="M20.3 4.4A17.7 17.7 0 0 0 15.5 3c-.2.4-.5 1-.7 1.4a16.3 16.3 0 0 0-4.6 0C9.9 4 9.6 3.4 9.4 3a17.8 17.8 0 0 0-4.8 1.4C2.5 8.5 1.8 12.4 2.2 16.2a17.9 17.9 0 0 0 5.4 2.8c.4-.6.8-1.2 1.1-1.9-.6-.2-1.2-.5-1.7-.9.1-.1.2-.2.3-.3 3.2 1.5 6.7 1.5 9.8 0 .1.1.2.2.3.3-.5.4-1.1.7-1.7.9.3.7.7 1.3 1.1 1.9a17.8 17.8 0 0 0 5.4-2.8c.5-4.4-.8-8.2-3.4-11.8ZM8.7 13.6c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
          </svg>
          {t("dashboard.discordLinkButton")}
        </a>
      )}

      <p className="text-xs text-white/35 leading-relaxed">{t("dashboard.discordUserIdHint")}</p>

      <a
        href={COMMUNITY_DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-xs text-purple-400 hover:text-purple-300 transition-colors"
      >
        {t("dashboard.discordJoinEyedComun")} →
      </a>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
