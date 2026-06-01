import { getAdminCommentsServer, getCurrentUserServer } from "@/lib/server-api";
import { AdminCommentTable, type CommentWithDetails } from "@/components/admin/admin-comment-table";

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, currentUser] = await Promise.all([searchParams, getCurrentUserServer()]);
  const response = await getAdminCommentsServer(params);
  
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
    
  const isSuperAdmin = Boolean(
    currentUser && currentUser.email && superAdminEmails.includes(currentUser.email.toLowerCase())
  );
  const comments = response.data || [];
  const total = response.total || 0;
  const page = response.page || 1;
  const limit = parseInt((params.limit as string) || "10");

  type CommentRow = {
    id: string;
    project_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at?: string | null;
    deleted_at?: string | null;
    deleted_by?: string | null;
    projects: { name: string } | { name: string }[] | null;
    profiles: { email: string; display_name: string | null; is_blocked?: boolean } | { email: string; display_name: string | null; is_blocked?: boolean }[] | null;
  };

  const mapped: CommentWithDetails[] = (comments as CommentRow[]).map((c) => ({
    id: c.id,
    project_id: c.project_id,
    user_id: c.user_id,
    content: c.content,
    created_at: c.created_at,
    updated_at: c.updated_at || null,
    deleted_at: c.deleted_at || null,
    deleted_by: c.deleted_by || null,
    projects: Array.isArray(c.projects) ? c.projects[0] : c.projects,
    profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comments</h1>
        <p className="text-muted-foreground">
          View and moderate user comments on projects
        </p>
      </div>
      <AdminCommentTable comments={mapped} total={total} currentPage={page} pageSize={limit} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
