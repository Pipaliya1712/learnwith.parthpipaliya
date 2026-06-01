import { getProjectByIdServer, getTagsServer } from "@/lib/server-api";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const projectData = await getProjectByIdServer(id);
  if (!projectData) notFound();
  
  const allTags = await getTagsServer();

  const initialData = {
    project: projectData,
    features: projectData.features || [],
    improvements: projectData.improvements || [],
    bugs: projectData.bugs || [],
    images: projectData.images || [],
    selectedTagIds: projectData.selectedTagIds || [],
    allTags: allTags,
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
