import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const [featuresRes, improvementsRes, bugsRes, imagesRes, tagsRes, allTagsRes] =
    await Promise.all([
      supabase
        .from("features")
        .select("*")
        .eq("project_id", id)
        .order("display_order"),
      supabase
        .from("improvements")
        .select("*")
        .eq("project_id", id)
        .order("display_order"),
      supabase
        .from("bugs")
        .select("*")
        .eq("project_id", id)
        .order("display_order"),
      supabase
        .from("project_images")
        .select("*")
        .eq("project_id", id)
        .order("display_order"),
      supabase
        .from("project_tags")
        .select("tag_id")
        .eq("project_id", id),
      supabase.from("tags").select("id, name, slug").order("name"),
    ]);

  const initialData = {
    project,
    features: featuresRes.data || [],
    improvements: improvementsRes.data || [],
    bugs: bugsRes.data || [],
    images: imagesRes.data || [],
    selectedTagIds: (tagsRes.data || []).map((pt) => pt.tag_id),
    allTags: allTagsRes.data || [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Project</h1>
        <p className="text-muted-foreground">Update project details and content</p>
      </div>
      <ProjectForm initialData={initialData} />
    </div>
  );
}
