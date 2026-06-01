import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminRole(session.user.role) || session.user.blocked) {
    redirect("/dashboard");
  }

  return <AdminShell adminEmail={session.user.email}>{children}</AdminShell>;
}
