import { Users } from "lucide-react";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminUi";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export default function AdminUsersPage() {
  return (
    <AdminPage>
      <AdminPageHeader
        title="Usuarios"
        description="Gestiona cuentas, bloqueos, insignias y acceso a la plataforma."
        icon={<Users className="h-5 w-5" />}
      />
      <AdminUsersTable />
    </AdminPage>
  );
}
