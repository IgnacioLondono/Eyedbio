import type { Metadata } from "next";
import ProfileView from "@/components/ProfileView";
import { getPublicProfile } from "@/lib/get-public-profile";
import { profileOgImageUrl, profilePublicUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    return {
      title: "Perfil no encontrado — Eyed.bio",
      robots: { index: false, follow: false },
    };
  }

  const title = `${profile.displayName} (@${profile.username})`;
  const description =
    profile.bio.trim() ||
    `Página link-in-bio de ${profile.displayName}. Enlaces, redes y más en Eyed.bio.`;
  const url = profilePublicUrl(profile.username);
  const ogImage = profileOgImageUrl(profile.username);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Eyed.bio",
      type: "profile",
      locale: "es_ES",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Perfil de ${profile.displayName} en Eyed.bio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  return <ProfileView username={username} />;
}
