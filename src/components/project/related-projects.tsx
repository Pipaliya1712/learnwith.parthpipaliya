import Image from "next/image";
import Link from "next/link";
import { TagBadge } from "@/components/project/tag-badge";
import { ArrowRight, ExternalLink, GitFork, Grid2X2 } from "lucide-react";
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
      <div className="flex items-center justify-between gap-4 border-b pb-3">
        <div className="flex items-center gap-3">
          <Grid2X2 className="size-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">
            Related Projects
          </h2>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {projects.slice(0, 3).map((project) => {
          const thumbnail = project.images?.[0];

          return (
            <Link
              key={project.id}
              href={`/dashboard/${project.slug}`}
              className="detail-surface group grid min-h-36 grid-cols-[145px_minmax(0,1fr)] rounded-xl border transition-all hover:-translate-y-1 hover:border-primary/45"
            >
              <div className="relative m-3 overflow-hidden rounded-lg bg-muted">
                {thumbnail ? (
                  <Image
                    src={thumbnail.image_url}
                    alt={thumbnail.alt_text || project.name}
                    fill
                    className="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    sizes="145px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <GitFork className="size-8 opacity-40" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-col justify-between py-5 pr-4">
                <div className="min-w-0">
                  <h3 className="line-clamp-1 text-base font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {project.name}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <TagBadge key={tag.id} tag={tag} />
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
                  <div className="flex gap-4">
                    {project.live_link && (
                      <span className="inline-flex items-center gap-1">
                        <ExternalLink className="size-3.5" />
                        Live
                      </span>
                    )}
                    {project.repo_link && (
                      <span className="inline-flex items-center gap-1">
                        <GitFork className="size-3.5" />
                        Repo
                      </span>
                    )}
                  </div>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
