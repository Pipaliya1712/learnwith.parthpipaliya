"use client";

import { useState } from "react";
import { SearchBar } from "@/components/layout/search-bar";
import { TagFilter } from "@/components/layout/tag-filter";
import { ProjectGrid } from "@/components/project/project-grid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Grid3X3, List } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const hasActiveFilters = search.length > 0 || selectedTags.length > 0;
  console.log("projects:", projects);
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

  const clearFilters = () => {
    setSearch("");
    setSelectedTags([]);
  };

  return (
    <div className="space-y-7">
      <div className="space-y-1 pt-2">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-lg text-muted-foreground">
          Browse all projects and find one to contribute to
        </p>
      </div>

      <div className="flex items-center gap-4 overflow-hidden">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
          className="w-[82px] shrink-0 transition-all duration-200 focus-within:w-72"
        />
        <TagFilter
          tags={tags}
          selectedTags={selectedTags}
          onClear={() => setSelectedTags([])}
          onToggle={(tagId) =>
            setSelectedTags((prev) =>
              prev.includes(tagId)
                ? prev.filter((t) => t !== tagId)
                : [...prev, tagId]
            )
          }
        />
        <div className="flex h-10 shrink-0 items-center rounded-lg border bg-background/45 p-1 shadow-sm">
          {[
            { value: "grid" as const, label: "Grid view", icon: Grid3X3 },
            { value: "list" as const, label: "List view", icon: List },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = viewMode === item.value;

            return (
              <Button
                key={item.value}
                variant="ghost"
                size="icon"
                aria-label={item.label}
                aria-pressed={isActive}
                className={cn(
                  "size-8 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground",
                  isActive &&
                    "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={() => setViewMode(item.value)}
              >
                <Icon className="size-4" />
              </Button>
            );
          })}
        </div>
      </div>

      <ProjectGrid
        projects={filtered}
        variant="dashboard"
        viewMode={viewMode}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
