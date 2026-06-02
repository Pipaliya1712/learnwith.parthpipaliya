"use client";

import Image from "next/image";
import Link from "next/link";
import { cleanImageUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/project/tag-badge";
import { ExternalLink, GitFork, LogIn } from "lucide-react";
import type { Project, Tag, ProjectImage } from "@/types";

type ProjectDetailModalProps = {
  project: Project | null;
  tags: Tag[];
  images: ProjectImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProjectDetailModal({
  project,
  tags,
  images,
  open,
  onOpenChange,
}: ProjectDetailModalProps) {
  if (!project) return null;

  const thumbnail = images?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {project.name}
          </DialogTitle>
          <DialogDescription className="line-clamp-3 text-sm">
            {project.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {thumbnail && (
            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={cleanImageUrl(thumbnail.image_url)}
                alt={thumbnail.alt_text || project.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 640px"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>

          <div className="flex gap-2">
            {project.live_link && (
              <a
                href={project.live_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </Button>
              </a>
            )}
            {project.repo_link && (
              <a
                href={project.repo_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-1.5">
                  <GitFork className="h-4 w-4" />
                  Repository
                </Button>
              </a>
            )}
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Sign in to explore full project details, features, improvements,
              and bugs.
            </p>
            <Link href="/login">
              <Button className="gap-2">
                <LogIn className="h-4 w-4" />
                Login to Explore
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
