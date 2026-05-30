import { ProjectGrid } from "@/components/project/project-grid";
import type { Project, Tag, ProjectImage } from "@/types";

type ProjectWithRelations = Project & {
  tags: Tag[];
  images: ProjectImage[];
};

type RelatedProjectsProps = {
  projects: ProjectWithRelations[];
};

export function RelatedProjects({ projects }: RelatedProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Related Projects</h2>
      <ProjectGrid projects={projects} variant="related" />
    </section>
  );
}
