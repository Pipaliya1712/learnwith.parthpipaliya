import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCommentTable, type CommentWithDetails } from "@/components/admin/admin-comment-table";

export default async function AdminCommentsPage() {
  const supabase = createAdminClient();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, project_id, user_id, content, created_at, projects(name), profiles(email, display_name)")
    .order("created_at", { ascending: false });

  const mapped: CommentWithDetails[] = (comments || []).map((c: any) => ({
    id: c.id,
    project_id: c.project_id,
    user_id: c.user_id,
    content: c.content,
    created_at: c.created_at,
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
