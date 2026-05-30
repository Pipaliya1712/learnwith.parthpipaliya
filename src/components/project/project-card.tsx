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
      className={`card-hover overflow-hidden border bg-card h-full flex flex-col ${
        project.is_visible && variant === "admin" ? "card-featured" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative w-full bg-muted ${
          isCompact ? "h-32" : "h-48"
        } overflow-hidden`}
      >
        {thumbnail ? (
          <Image
            src={thumbnail.image_url}
            alt={thumbnail.alt_text || project.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <GitFork className="h-12 w-12 opacity-30" />
          </div>
        )}
      </div>

      <CardHeader className={`${isCompact ? "p-3 pb-1" : "p-4 pb-2"}`}>
        <h3
          className={`font-semibold tracking-tight line-clamp-1 ${
            isCompact ? "text-sm" : "text-lg"
          }`}
        >
          {project.name}
        </h3>
        <p
          className={`text-muted-foreground line-clamp-3 ${
            isCompact ? "text-xs" : "text-sm"
          }`}
        >
          {project.summary}
        </p>
      </CardHeader>

      <CardContent className={`${isCompact ? "px-3 pb-1" : "px-4 pb-2"}`}>
        <div className="flex flex-wrap gap-1">
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
        className={`mt-auto border-t border-border/50 ${
          isCompact ? "p-3 pt-2" : "p-4 pt-3"
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
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
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
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
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
