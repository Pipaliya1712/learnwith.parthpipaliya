"use client";

import { useState } from "react";
import { SearchBar } from "@/components/layout/search-bar";
import { TagFilter } from "@/components/layout/tag-filter";
import { ProjectGrid } from "@/components/project/project-grid";
import type { Project, Tag, ProjectImage } from "@/types";

type ProjectWithRelations = Project & {
  images: ProjectImage[];
  tags: Tag[];
};

type DashboardContentProps = {
  projects: ProjectWithRelations[];
  tags: Tag[];
};

export function DashboardContent({ projects, tags }: DashboardContentProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Browse all projects and find one to contribute to
        </p>
      </div>

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

      <ProjectGrid projects={filtered} variant="dashboard" />
    </div>
  );
}
