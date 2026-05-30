import Image from "next/image";
import Link from "next/link";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectCardSkeleton } from "@/components/project/project-card-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TagBadge } from "@/components/project/tag-badge";
import {
  ArrowUpDown,
  ExternalLink,
  FileCode2,
  FolderSearch,
  GitFork,
  Grid3X3,
  RefreshCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
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
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  viewMode?: "grid" | "list";
};

const emptySuggestions = [
  {
    icon: Search,
    title: "Check your search",
    description: "Make sure keywords are spelled correctly.",
  },
  {
    icon: SlidersHorizontal,
    title: "Adjust filters",
    description: "Try changing or removing some filters.",
  },
  {
    icon: ArrowUpDown,
    title: "Change sorting",
    description: "Switch to a different sorting option.",
  },
  {
    icon: Grid3X3,
    title: "Explore all projects",
    description: "View all projects without any filters.",
  },
];

export function ProjectGrid({
  projects,
  variant = "dashboard",
  isLoading,
  onProjectClick,
  skeletonsCount = 6,
  hasActiveFilters,
  onClearFilters,
  viewMode = "grid",
}: ProjectGridProps) {
  const cols =
    variant === "related"
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  if (isLoading) {
    return (
      <div className={`grid gap-5 ${cols}`}>
        {Array.from({ length: skeletonsCount }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-10 py-8 text-center">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <div className="relative mb-8 h-56 w-full max-w-md">
            <div className="absolute left-1/2 top-16 h-24 w-40 -translate-x-1/2 rounded-2xl bg-gradient-to-b from-muted to-card shadow-2xl ring-1 ring-border">
              <div className="absolute left-14 top-14 size-2 rounded-full bg-muted-foreground/70" />
              <div className="absolute right-14 top-14 size-2 rounded-full bg-muted-foreground/70" />
              <div className="absolute left-1/2 top-[76px] h-0.5 w-4 -translate-x-1/2 rounded-full bg-muted-foreground/60" />
            </div>
            <div className="absolute left-[18%] top-8 flex h-24 w-16 -rotate-12 items-center justify-center rounded-lg bg-gradient-to-b from-muted/90 to-card text-foreground shadow-xl ring-1 ring-border">
              <FileCode2 className="size-8 text-foreground/80" />
            </div>
            <div className="absolute left-[47%] top-1 h-28 w-16 rotate-3 rounded-lg bg-gradient-to-b from-muted/90 to-card p-3 shadow-xl ring-1 ring-border">
              <div className="mb-4 h-1.5 rounded-full bg-primary/80" />
              <div className="space-y-2">
                <div className="h-1 rounded-full bg-muted-foreground/40" />
                <div className="h-1 rounded-full bg-muted-foreground/30" />
                <div className="h-1 rounded-full bg-muted-foreground/20" />
              </div>
            </div>
            <div className="absolute right-[18%] top-10 h-24 w-16 rotate-12 rounded-lg bg-gradient-to-b from-muted/90 to-card p-3 shadow-xl ring-1 ring-border">
              <div className="mb-3 h-1.5 rounded-full bg-primary/80" />
              <div className="grid grid-cols-2 gap-1">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-4 rounded-sm border border-muted-foreground/25"
                  />
                ))}
              </div>
            </div>
            <div className="absolute right-[22%] top-[92px] flex size-20 items-center justify-center rounded-full border-[7px] border-primary bg-background/70 shadow-xl">
              <FolderSearch className="size-9 text-muted-foreground" />
            </div>
            <div className="absolute right-[16%] top-[150px] h-12 w-3 rotate-[-45deg] rounded-full bg-muted-foreground/50" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight">No projects found</h2>
          <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
            We couldn&apos;t find any projects matching your search. Try
            adjusting your search or filters.
          </p>
          {hasActiveFilters && (
            <Button
              className="mt-6 h-11 gap-2 bg-primary px-6 shadow-lg shadow-primary/20"
              onClick={onClearFilters}
            >
              <RefreshCcw className="size-4" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="mx-auto max-w-5xl rounded-xl border bg-card/35 p-6 text-left shadow-sm">
          <h3 className="mb-5 text-sm font-semibold">Try these suggestions</h3>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-0">
            {emptySuggestions.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`space-y-4 xl:px-6 ${
                    index > 0 ? "xl:border-l" : ""
                  }`}
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground shadow-sm">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "list" && variant === "dashboard") {
    return (
      <div className="space-y-3">
        {projects.map((project) => {
          const thumbnail = project.images?.[0];

          return (
            <Link
              key={project.id}
              href={`/dashboard/${project.slug}`}
              className="group flex min-h-32 flex-col gap-4 rounded-lg border bg-card/80 p-3 shadow-sm ring-1 ring-foreground/5 transition-all hover:-translate-y-1 hover:border-primary/45 hover:bg-card hover:shadow-xl hover:shadow-primary/10 sm:flex-row"
            >
              <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-md bg-muted sm:h-28 sm:w-40">
                {thumbnail ? (
                  <Image
                    src={thumbnail.image_url}
                    alt={thumbnail.alt_text || project.name}
                    fill
                    className="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    sizes="160px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <GitFork className="size-8 opacity-40" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                <div className="min-w-0">
                  <h3 className="line-clamp-1 text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {project.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {project.summary}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 4).map((tag) => (
                      <TagBadge key={tag.id} tag={tag} />
                    ))}
                    {project.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 4}
                      </Badge>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-3 text-sm text-muted-foreground">
                    {project.live_link && (
                      <a
                        href={project.live_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                      >
                        <ExternalLink className="size-4" />
                        Live
                      </a>
                    )}
                    {project.repo_link && (
                      <a
                        href={project.repo_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                      >
                        <GitFork className="size-4" />
                        Repo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid gap-5 ${cols}`}>
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
