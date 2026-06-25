import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSupportQueue from "@/components/admin/AdminSupportQueue";
import { LifeBuoy } from "lucide-react";

export default function AdminSupportPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl">
      <AdminPageHeader
        title="Soporte"
        description="Responde tickets de usuarios con problemas en la web, perfil o cuenta."
        icon={<LifeBuoy className="w-5 h-5" />}
      />
      <AdminSupportQueue />
    </div>
  );
}
