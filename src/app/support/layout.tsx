import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function SupportLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/support");
  }
  return children;
}
