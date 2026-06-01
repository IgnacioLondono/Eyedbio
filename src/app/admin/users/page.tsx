import AdminUsersTable from "@/components/admin/AdminUsersTable";

export default function AdminUsersPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-1">Usuarios</h1>
      <p className="text-white/45 text-sm mb-6">
        Gestiona cuentas, bloqueos y acceso a la plataforma.
      </p>
      <AdminUsersTable />
    </div>
  );
}
