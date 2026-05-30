"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { TagBadge } from "@/components/project/tag-badge";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, GitFork } from "lucide-react";
import type { Project, Tag, ProjectImage } from "@/types";

type ProjectCardProps = {
  project: Project;
  tags: Tag[];
  images: ProjectImage[];
  variant?: "landing" | "dashboard" | "admin" | "related";
  onClick?: () => void;
};

export function ProjectCard({
  project,
  tags,
  images,
  variant = "dashboard",
  onClick,
}: ProjectCardProps) {
  const thumbnail = images?.[0];
  const href =
    variant === "admin"
      ? `/admin/projects/${project.id}/edit`
      : variant === "landing"
        ? undefined
        : `/dashboard/${project.slug}`;

  const isCompact = variant === "related";

  const cardContent = (
    <Card
      className={`card-hover h-full overflow-hidden rounded-lg border border-border/80 bg-card p-0 shadow-sm ring-1 ring-foreground/5 flex flex-col ${
        project.is_visible && variant === "admin" ? "card-featured" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative w-full bg-muted ${
          isCompact ? "h-32" : "h-[240px]"
        } overflow-hidden`}
      >
        {thumbnail ? (
          <>
            <Image
              src={thumbnail.image_url}
              alt={thumbnail.alt_text || project.name}
              fill
              className="object-cover grayscale transition duration-500 group-hover:scale-110 group-hover:grayscale-0 group-hover:brightness-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <GitFork className="h-12 w-12 opacity-30" />
          </div>
        )}
      </div>

      <CardHeader className={`${isCompact ? "p-3 pb-1" : "p-5 pb-2"}`}>
        <h3
          className={`font-semibold tracking-tight line-clamp-1 transition-colors group-hover:text-primary ${
            isCompact ? "text-sm" : "text-2xl"
          }`}
        >
          {project.name}
        </h3>
        <p
          className={`text-muted-foreground line-clamp-3 ${
            isCompact ? "text-xs" : "text-base"
          }`}
        >
          {project.summary}
        </p>
      </CardHeader>

      <CardContent className={`${isCompact ? "px-3 pb-1" : "px-5 pb-5"}`}>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter
        className={`mt-auto border-t border-border/70 bg-muted/40 transition-colors group-hover:bg-muted/60 ${
          isCompact ? "p-3 pt-2" : "p-5 py-4"
        }`}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-2">
            {project.live_link && (
              <a
                href={project.live_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Live
              </a>
            )}
            {project.repo_link && (
              <a
                href={project.repo_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <GitFork className="h-3.5 w-3.5" />
                Repo
              </a>
            )}
          </div>
          {variant === "admin" && (
            <div className="flex items-center gap-2">
              {project.is_visible && (
                <Badge variant="default" className="text-xs">
                  Visible
                </Badge>
              )}
              {project.is_deleted && (
                <Badge variant="destructive" className="text-xs">
                  Deleted
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );

  if (variant === "landing" && onClick) {
    return (
      <div className="group cursor-pointer" onClick={onClick}>
        {cardContent}
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className="group block">
        {cardContent}
      </Link>
    );
  }

  return <div className="group">{cardContent}</div>;
}
