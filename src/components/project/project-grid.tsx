import { ProjectCard } from "@/components/project/project-card";
import { ProjectCardSkeleton } from "@/components/project/project-card-skeleton";
import type { Project, Tag, ProjectImage } from "@/types";

type ProjectWithRelations = Project & {
  tags: Tag[];
  images: ProjectImage[];
};

type ProjectGridProps = {
  projects: ProjectWithRelations[];
  variant?: "landing" | "dashboard" | "admin" | "related";
  isLoading?: boolean;
  onProjectClick?: (project: Project) => void;
  skeletonsCount?: number;
};

export function ProjectGrid({
  projects,
  variant = "dashboard",
  isLoading,
  onProjectClick,
  skeletonsCount = 6,
}: ProjectGridProps) {
  const cols =
    variant === "related"
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  if (isLoading) {
    return (
      <div className={`grid gap-4 ${cols}`}>
        {Array.from({ length: skeletonsCount }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No projects found
        </p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${cols}`}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          tags={project.tags}
          images={project.images}
          variant={variant}
          onClick={
            variant === "landing"
              ? () => onProjectClick?.(project)
              : undefined
          }
        />
      ))}
    </div>
  );
}
