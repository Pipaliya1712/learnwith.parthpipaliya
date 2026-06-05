"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SearchBar } from "@/components/layout/search-bar";
import { TagFilter } from "@/components/layout/tag-filter";
import { ProjectGrid } from "@/components/project/project-grid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Grid3X3, List } from "lucide-react";
import type { Project, Tag, ProjectImage } from "@/types";
import { projectsApi } from "@/lib/api-client";

type ProjectWithRelations = Project & {
  images: ProjectImage[];
  tags: Tag[];
};

type DashboardContentProps = {
  projects: ProjectWithRelations[];
  total: number;
  tags: Tag[];
};

const PROJECTS_BATCH_SIZE = 12;

export function DashboardContent({
  projects: initialProjects,
  total: initialTotal,
  tags,
}: DashboardContentProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [projects, setProjects] = useState(initialProjects);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasActiveFilters = search.length > 0 || selectedTags.length > 0;
  const debouncedSearch = useDebouncedValue(search, 350);
  const hasMoreProjects = projects.length < total;

  useEffect(() => {
    let isActive = true;

    async function loadFirstPage() {
      setIsLoading(true);
      try {
        const response = await projectsApi.dashboard({
          skip: 0,
          limit: PROJECTS_BATCH_SIZE,
          search: debouncedSearch,
          tagIds: selectedTags,
        });
        if (!isActive) return;
        setProjects(response.projects as ProjectWithRelations[]);
        setTotal(response.total);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadFirstPage();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, selectedTags]);

  const loadMoreProjects = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMoreProjects) return;

    setIsLoadingMore(true);
    try {
      const response = await projectsApi.dashboard({
        skip: projects.length,
        limit: PROJECTS_BATCH_SIZE,
        search: debouncedSearch,
        tagIds: selectedTags,
      });
      setProjects((current) => [
        ...current,
        ...(response.projects as ProjectWithRelations[]),
      ]);
      setTotal(response.total);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    debouncedSearch,
    hasMoreProjects,
    isLoading,
    isLoadingMore,
    projects.length,
    selectedTags,
  ]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMoreProjects) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreProjects();
        }
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMoreProjects, loadMoreProjects]);

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
        projects={projects}
        variant="dashboard"
        viewMode={viewMode}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />
      {(isLoading || isLoadingMore) && (
        <div className="py-2 text-center text-sm text-muted-foreground">
          Loading projects...
        </div>
      )}
      {hasMoreProjects && (
        <div ref={loadMoreRef} className="h-8" aria-label="Load more projects" />
      )}
    </div>
  );
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}
