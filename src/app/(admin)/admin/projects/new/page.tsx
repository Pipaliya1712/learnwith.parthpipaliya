import { ProjectForm } from "@/components/admin/project-form";
import { getTagsServer } from "@/lib/server-api";

export default async function NewProjectPage() {
  const tags = await getTagsServer();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Project</h1>
        <p className="text-muted-foreground">Add a new project for developers to explore</p>
      </div>
      <ProjectForm initialData={{ project: {} as any, features: [], improvements: [], bugs: [], images: [], selectedTagIds: [], allTags: tags }} />
    </div>
  );
}
