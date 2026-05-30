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
    <div className="space-y-7">
      <div className="space-y-1 pt-2">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-lg text-muted-foreground">
          Browse all projects and find one to contribute to
        </p>
      </div>

      <div className="flex items-center gap-5 overflow-hidden">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
          className="w-[82px] shrink-0 transition-all duration-200 focus-within:w-72"
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
