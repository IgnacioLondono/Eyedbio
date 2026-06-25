import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl">
      <AdminPageHeader
        title="Usuarios"
        description="Gestiona cuentas, bloqueos, insignias y acceso a la plataforma."
        icon={<Users className="w-5 h-5" />}
      />
      <AdminUsersTable />
    </div>
  );
}
