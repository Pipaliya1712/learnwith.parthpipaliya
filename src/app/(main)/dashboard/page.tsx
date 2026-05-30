import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardContent } from "@/components/project/dashboard-content";

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  const { data: tags } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name");

  const projectIds = (projects || []).map((p) => p.id);

  const { data: allImages } = projectIds.length
    ? await supabase
        .from("project_images")
        .select("*")
        .in("project_id", projectIds)
        .order("display_order")
    : { data: [] };

  const { data: allProjectTags } = projectIds.length
    ? await supabase
        .from("project_tags")
        .select("project_id, tags(id, name, slug)")
        .in("project_id", projectIds)
    : { data: [] };

  const projectsWithRelations = (projects || []).map((project) => ({
    ...project,
    images: (allImages || []).filter((img) => img.project_id === project.id),
    tags: (allProjectTags || [])
      .filter((pt) => pt.project_id === project.id)
      .map((pt) => pt.tags),
  }));

  return <DashboardContent projects={projectsWithRelations} tags={tags || []} />;
}
