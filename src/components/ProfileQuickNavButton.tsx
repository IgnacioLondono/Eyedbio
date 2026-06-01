"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { House } from "lucide-react";
import { useI18n } from "@/components/LocaleProvider";

interface Props {
  profileUsername: string;
}

export default function ProfileQuickNavButton({ profileUsername }: Props) {
  const { data: session } = useSession();
  const { t } = useI18n();

  const isOwner =
    (session?.user?.username ?? "").toLowerCase() === profileUsername.toLowerCase();

  const href = isOwner ? "/dashboard" : "/";
  const label = isOwner ? t("quickNav.dashboard") : t("quickNav.home");

  return (
    <Link
      href={href}
      className="fixed top-6 right-6 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:text-white"
      aria-label={label}
      title={label}
    >
      <House className="h-4 w-4" />
    </Link>
  );
}
