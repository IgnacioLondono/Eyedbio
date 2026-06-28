"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { LockedPublicProfile } from "@/types/public-profile";
import { storeProfileUnlockToken } from "@/lib/profile/profile-unlock-client";
import { useI18n } from "@/components/providers/LocaleProvider";

interface Props {
  profile: LockedPublicProfile;
  onUnlocked: () => void;
}

export default function ProfileAccessGate({ profile, onUnlocked }: Props) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/profile/${profile.username}/unlock`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("accessGate.wrongCode"));
        return;
      }

      if (typeof data.token === "string") {
        storeProfileUnlockToken(profile.username, data.token);
      }

      onUnlocked();
    } catch {
      setError(t("accessGate.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-20 flex min-h-[100dvh] w-full items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/70 px-6 py-8 shadow-2xl backdrop-blur-md text-center">
        <img
          src={profile.avatarUrl}
          alt=""
          className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-white/10"
        />
        <h1 className="mt-4 text-lg font-semibold text-white">{profile.displayName}</h1>
        <p className="mt-1 text-sm text-white/45">@{profile.username}</p>

        <div className="mt-6 flex items-center justify-center gap-2 text-purple-300/90">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">{t("accessGate.protected")}</span>
        </div>
        <p className="mt-2 text-xs text-white/40 leading-relaxed">{t("accessGate.hint")}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
          <input
            type="password"
            inputMode="text"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
            placeholder={t("accessGate.codePlaceholder")}
            className="input-field w-full text-center font-mono tracking-widest"
            required
            minLength={4}
            maxLength={32}
            aria-label={t("accessGate.codeLabel")}
          />

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 4}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("accessGate.verifying")}
              </>
            ) : (
              t("accessGate.submit")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
