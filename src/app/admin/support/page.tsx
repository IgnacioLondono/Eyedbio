import { LifeBuoy } from "lucide-react";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminUi";
import AdminSupportQueue from "@/components/admin/AdminSupportQueue";

export default function AdminSupportPage() {
  return (
    <AdminPage>
      <AdminPageHeader
        title="Soporte"
        description="Responde tickets de usuarios con problemas en la web, perfil o cuenta."
        icon={<LifeBuoy className="h-5 w-5" />}
      />
      <AdminSupportQueue />
    </AdminPage>
  );
}
