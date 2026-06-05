import { getAdminUsersServer } from "@/lib/server-api";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import { getSession } from "@/lib/session";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase());
  const isSuperAdmin = Boolean(
    session?.email && superAdminEmails.includes(session.email.toLowerCase())
  );

  const response = await getAdminUsersServer(params);
  const profiles = response.users || [];
  const total = response.total || 0;
  const page = response.page || 1;
  const limit = parseInt((params.limit as string) || "10");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage registered developers and their access
        </p>
      </div>
      <AdminUserTable
        key={JSON.stringify(params)}
        users={profiles}
        total={total}
        currentPage={page}
        pageSize={limit}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
