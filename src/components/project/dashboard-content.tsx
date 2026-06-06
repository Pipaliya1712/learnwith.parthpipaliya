"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SearchBar } from "@/components/layout/search-bar";
import { ProjectGrid } from "@/components/project/project-grid";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bot,
  Brain,
  ChevronDown,
  Cloud,
  Container,
  Filter,
  Grid3X3,
  Layers3,
  List,
  Network,
  Sparkles,
  ArrowDownUp,
  type LucideIcon,
} from "lucide-react";
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
const VISIBLE_TAG_COUNT = 10;

type SortOption = "newest" | "oldest" | "name";

const sortConfig: Record<SortOption, { label: string; sortBy: string; sortDesc: boolean }> = {
  newest: { label: "Newest first", sortBy: "created_at", sortDesc: true },
  oldest: { label: "Oldest first", sortBy: "created_at", sortDesc: false },
  name: { label: "Name A-Z", sortBy: "name", sortDesc: false },
};

export function DashboardContent({
  projects: initialProjects,
  total: initialTotal,
  tags,
}: DashboardContentProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [sort, setSort] = useState<SortOption>("newest");
  const [projects, setProjects] = useState(initialProjects);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasActiveFilters = search.length > 0 || selectedTags.length > 0;
  const debouncedSearch = useDebouncedValue(search, 350);
  const hasMoreProjects = projects.length < total;
  const visibleTags = tags.slice(0, VISIBLE_TAG_COUNT);
  const overflowTags = tags.slice(VISIBLE_TAG_COUNT);
  const activeFilterCount = selectedTags.length;

  useEffect(() => {
    let isActive = true;
    const selectedSort = sortConfig[sort];

    async function loadFirstPage() {
      setIsLoading(true);
      try {
        const response = await projectsApi.dashboard({
          skip: 0,
          limit: PROJECTS_BATCH_SIZE,
          search: debouncedSearch,
          tagIds: selectedTags,
          sortBy: selectedSort.sortBy,
          sortDesc: selectedSort.sortDesc,
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
  }, [debouncedSearch, selectedTags, sort]);

  const loadMoreProjects = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMoreProjects) return;

    const selectedSort = sortConfig[sort];
    setIsLoadingMore(true);
    try {
      const response = await projectsApi.dashboard({
        skip: projects.length,
        limit: PROJECTS_BATCH_SIZE,
        search: debouncedSearch,
        tagIds: selectedTags,
        sortBy: selectedSort.sortBy,
        sortDesc: selectedSort.sortDesc,
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
    sort,
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

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((tag) => tag !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="space-y-7">
      <div className="space-y-1 pt-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Projects</h1>
        <p className="text-lg text-muted-foreground sm:text-lg">
          Browse all projects and find one to contribute to
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,1fr)_auto_auto_auto]">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
          shortcut="Ctrl K"
          className="min-w-0"
          iconClassName="left-4 size-6"
          inputClassName="h-14 rounded-2xl border-primary/35 bg-card/45 pl-15 pr-28 text-lg shadow-lg shadow-primary/5 focus-visible:border-primary/70 focus-visible:ring-primary/20 sm:text-xl"
          clearButtonClassName="right-5 size-6 rounded-lg"
        />

        <Button
          variant="outline"
          className="h-14 justify-between gap-4 rounded-2xl border-border/80 bg-card/35 px-7 text-base text-muted-foreground shadow-sm hover:border-primary/45 hover:bg-card"
          onClick={() => setShowFilters((value) => !value)}
          aria-expanded={showFilters}
        >
          <span className="flex items-center gap-3">
            <Filter className="size-6" />
            <span className="">Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground shadow-lg shadow-primary/25">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "size-6 transition-transform",
              showFilters && "rotate-180"
            )}
          />
        </Button>

        <div className="flex h-14 items-center gap-4 rounded-2xl border border-border/80 bg-card/35 px-6 shadow-sm">
          <ArrowDownUp className="size-6 text-muted-foreground" />
          <div className="min-w-24">
            <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
              <SelectTrigger className="h-auto border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" className="min-w-44">
                {Object.entries(sortConfig).map(([value, option]) => (
                  <SelectItem key={value} value={value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex h-14 shrink-0 items-center gap-2 rounded-2xl border border-border/80 bg-card/35 p-2 shadow-sm">
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
                    "border border-primary/70 bg-primary/15 text-primary shadow-lg shadow-primary/20 hover:bg-primary/20 hover:text-primary"
                )}
                onClick={() => setViewMode(item.value)}
              >
                <Icon className="size-6" />
              </Button>
            );
          })}
        </div>
      </div>

      {showFilters && (
        <div className="rounded-2xl border border-border/80 bg-card/25 p-6 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <TagChip
              label="All"
              active={selectedTags.length === 0}
              icon={Layers3}
              onClick={() => setSelectedTags([])}
            />
            {visibleTags.map((tag) => (
              <TagChip
                key={tag.id}
                label={tag.name}
                active={selectedTags.includes(tag.id)}
                icon={getTagIcon(tag.name)}
                onClick={() => toggleTag(tag.id)}
              />
            ))}
            {overflowTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-10 items-center gap-3 rounded-xl border border-border/80 bg-background/35 px-5 text-sm font-semibold text-muted-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-foreground">
                  More
                  <ChevronDown className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-56 ">
                  {overflowTags.map((tag) => (
                    <DropdownMenuItem
                      key={tag.id}
                      className="gap-2 py-2"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {(() => {
                        const Icon = getTagIcon(tag.name);
                        return <Icon className="size-4 text-primary " />;
                      })()}
                      <span>{tag.name}</span>
                      {selectedTags.includes(tag.id) && (
                        <span className="ml-auto text-xs text-primary">Selected</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground sm:text-base">
        <Sparkles className="size-4 text-primary" />
        <span>Tip: Use filters to find projects that match your interests</span>
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

function TagChip({
  label,
  active,
  icon: Icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-10 gap-3 rounded-xl border-border/80 bg-background/35 px-5 text-sm font-semibold text-foreground shadow-sm hover:border-primary/50 hover:bg-primary/10",
        active &&
          "border-primary/70 bg-primary/15 text-primary shadow-lg shadow-primary/15 hover:bg-primary/20 hover:text-primary"
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-lg text-primary",
          active &&
      "bg-primary text-primary-foreground"
        )}
      >
        <Icon className="size-4" />
      </span>
      {label}
    </Button>
  );
}

function getTagIcon(name: string): LucideIcon {
  const normalized = name.toLowerCase();

  if (normalized.includes("ai")) return Bot;
  if (normalized.includes("analytic")) return BarChart3;
  if (normalized.includes("aws") || normalized.includes("cloud")) return Cloud;
  if (normalized.includes("docker")) return Container;
  if (normalized.includes("kubernetes")) return Network;
  if (normalized.includes("machine") || normalized.includes("llm")) return Brain;

  return Layers3;
}
