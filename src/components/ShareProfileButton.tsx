"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

interface Props {
  username: string;
  displayName?: string;
  variant?: "floating" | "inline";
}

export default function ShareProfileButton({
  username,
  displayName,
  variant = "floating",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${username}`
      : `/${username}`;

  const share = async () => {
    setSharing(true);
    const title = displayName ? `${displayName} (@${username})` : `@${username}`;
    const text = `Mira mi perfil en Eyed.bio`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text, url: profileUrl });
        return;
      }

      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(profileUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* ignore */
        }
      }
    } finally {
      setSharing(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={share}
          disabled={sharing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Share2 className="w-4 h-4" />
          Compartir perfil
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
          {copied ? "Enlace copiado" : "Copiar enlace"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={share}
      disabled={sharing}
      className="fixed top-6 left-6 z-30 flex items-center gap-2 px-3 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all text-xs font-medium disabled:opacity-50"
      aria-label="Compartir perfil"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-400" />
          Copiado
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Compartir
        </>
      )}
    </button>
  );
}
