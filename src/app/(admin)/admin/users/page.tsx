import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import { getSession } from "@/lib/session";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();
  const session = await getSession();
  const isSuperAdmin = session?.email === process.env.SUPER_ADMIN_EMAIL;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, is_blocked, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage registered developers and their access
        </p>
      </div>
      <AdminUserTable users={profiles || []} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
