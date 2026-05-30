import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminProjectList } from "@/components/admin/admin-project-list";

export default async function AdminProjectsPage() {
  const supabase = createAdminClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  const projectIds = (projects || []).map((p) => p.id);

  const { data: allProjectTags } = projectIds.length
    ? await supabase
        .from("project_tags")
        .select("project_id, tags(id, name, slug)")
        .in("project_id", projectIds)
    : { data: [] };

  const projectsWithTags = (projects || []).map((project) => ({
    ...project,
    tags: (allProjectTags || [])
      .filter((pt) => pt.project_id === project.id)
      .map((pt) => pt.tags),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage all projects and landing page visibility
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </Link>
      </div>

      <AdminProjectList projects={projectsWithTags} />
    </div>
  );
}
