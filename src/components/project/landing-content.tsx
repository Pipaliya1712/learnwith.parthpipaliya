"use client";

import { useState } from "react";
import { SearchBar } from "@/components/layout/search-bar";
import { TagFilter } from "@/components/layout/tag-filter";
import { ProjectGrid } from "@/components/project/project-grid";
import { ProjectDetailModal } from "@/components/project/project-detail-modal";
import type { Project, Tag, ProjectImage } from "@/types";

type ProjectWithRelations = Project & {
  images: ProjectImage[];
  tags: Tag[];
};

type LandingContentProps = {
  projects: ProjectWithRelations[];
  tags: Tag[];
};

export function LandingContent({ projects, tags }: LandingContentProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithRelations | null>(null);

  const filtered = projects.filter((project) => {
    const matchesSearch =
      !search ||
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.summary.toLowerCase().includes(search.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      project.tags.some((t) => selectedTags.includes(t.id));

    return matchesSearch && matchesTags;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
        />
        <TagFilter
          tags={tags}
          selectedTags={selectedTags}
          onToggle={(tagId) =>
            setSelectedTags((prev) =>
              prev.includes(tagId)
                ? prev.filter((t) => t !== tagId)
                : [...prev, tagId]
            )
          }
        />
      </div>

      <ProjectGrid
        projects={filtered}
        variant="landing"
        onProjectClick={(project) => setSelectedProject(project as ProjectWithRelations)}
      />

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          tags={selectedProject.tags}
          images={selectedProject.images}
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
        />
      )}
    </div>
  );
}
