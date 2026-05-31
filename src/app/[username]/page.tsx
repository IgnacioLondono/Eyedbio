import ProfileView from "@/components/ProfileView";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  return <ProfileView username={username} />;
}
