import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCommentTable, type CommentWithDetails } from "@/components/admin/admin-comment-table";

export default async function AdminCommentsPage() {
  const supabase = createAdminClient();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, project_id, user_id, content, created_at, deleted_at, deleted_by, projects(name), profiles(email, display_name)")
    .order("created_at", { ascending: false });

  type CommentRow = {
    id: string;
    project_id: string;
    user_id: string;
    content: string;
    created_at: string;
    deleted_at: string | null;
    deleted_by: string | null;
    projects: { name: string } | { name: string }[] | null;
    profiles: { email: string; display_name: string | null } | { email: string; display_name: string | null }[] | null;
  };

  const mapped: CommentWithDetails[] = ((comments || []) as CommentRow[]).map((c) => ({
    id: c.id,
    project_id: c.project_id,
    user_id: c.user_id,
    content: c.content,
    created_at: c.created_at,
    deleted_at: c.deleted_at,
    deleted_by: c.deleted_by,
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
      <AdminCommentTable comments={mapped} />
    </div>
  );
}
