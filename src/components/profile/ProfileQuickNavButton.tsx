"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { House } from "lucide-react";
import { useI18n } from "@/components/providers/LocaleProvider";
import { teardownProfilePresentation } from "@/lib/profile/profile-teardown";

interface Props {
  profileUsername: string;
  /** Resuelto en servidor para evitar href incorrecto mientras carga la sesión. */
  viewerIsOwner?: boolean;
}

export default function ProfileQuickNavButton({ profileUsername, viewerIsOwner }: Props) {
  const { data: session, status } = useSession();
  const { t } = useI18n();

  const sessionIsOwner =
    status === "authenticated" &&
    (session?.user?.username ?? "").toLowerCase() === profileUsername.toLowerCase();

  const isOwner = viewerIsOwner ?? sessionIsOwner;
  const href = isOwner ? "/dashboard" : "/";
  const label = isOwner ? t("quickNav.dashboard") : t("quickNav.home");

  const shellClass =
    "absolute top-6 right-6 z-[210] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:text-white hover:bg-black/55";

  const leaveProfile = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    teardownProfilePresentation();
    window.location.assign(href);
  };

  if (viewerIsOwner === undefined && status === "loading") {
    return (
      <span
        className={`${shellClass} pointer-events-none opacity-60`}
        aria-hidden="true"
        title={t("common.loading")}
      >
        <House className="h-4 w-4" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={shellClass}
      aria-label={label}
      title={label}
      onClick={leaveProfile}
    >
      <House className="h-4 w-4" />
    </Link>
  );
}
