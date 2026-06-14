"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SearchCommand } from "@/components/search/search-command";
import { ProjectGrid } from "@/components/project/project-grid";
import { UserGrid } from "@/components/user/user-grid";
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
import type { Project, Tag, ProjectImage, PublicUser } from "@/types";
import { projectsApi, usersApi } from "@/lib/api-client";

type ProjectWithRelations = Project & {
  images: ProjectImage[];
  tags: Tag[];
};

type DashboardContentProps = {
  projects: ProjectWithRelations[];
  total: number;
  tags: Tag[];
};

type SearchCategory = "all" | "projects" | "users" | "technologies";

const PROJECTS_BATCH_SIZE = 12;
const USERS_BATCH_SIZE = 12;
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

  // User search state
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasActiveFilters = search.length > 0 || selectedTags.length > 0;
  const showProjectsGrid = activeCategory !== "users";
  const hasMoreProjects = projects.length < total;
  const hasMoreUsers = users.length < userTotal;
  const visibleTags = tags.slice(0, VISIBLE_TAG_COUNT);
  const overflowTags = tags.slice(VISIBLE_TAG_COUNT);
  const activeFilterCount = selectedTags.length;

  // ─── PROJECT SEARCH ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!showProjectsGrid) return;
    let isActive = true;
    const selectedSort = sortConfig[sort];

    async function loadFirstPage() {
      setIsLoading(true);
      try {
        const response = await projectsApi.dashboard({
          skip: 0,
          limit: PROJECTS_BATCH_SIZE,
          search: search || undefined,
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
  }, [search, selectedTags, sort, showProjectsGrid]);

  // ─── USER SEARCH ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (showProjectsGrid) return;
    let isActive = true;

    async function loadUsers() {
      setIsLoadingUsers(true);
      try {
        const response = await usersApi.search({
          search: search || undefined,
          skip: 0,
          limit: USERS_BATCH_SIZE,
        });
        if (!isActive) return;
        setUsers(response.users as PublicUser[]);
        setUserTotal(response.total);
      } finally {
        if (isActive) setIsLoadingUsers(false);
      }
    }

    loadUsers();

    return () => {
      isActive = false;
    };
  }, [search, showProjectsGrid]);

  // ─── LOAD MORE PROJECTS (INFINITE SCROLL) ────────────────────────────────
  const loadMoreProjects = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMoreProjects) return;

    const selectedSort = sortConfig[sort];
    setIsLoadingMore(true);
    try {
      const response = await projectsApi.dashboard({
        skip: projects.length,
        limit: PROJECTS_BATCH_SIZE,
        search: search || undefined,
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
  }, [search, hasMoreProjects, isLoading, isLoadingMore, projects.length, selectedTags, sort]);

  // ─── LOAD MORE USERS (INFINITE SCROLL) ──────────────────────────────────
  const loadMoreUsers = useCallback(async () => {
    if (isLoadingUsers || isLoadingMoreUsers || !hasMoreUsers) return;

    setIsLoadingMoreUsers(true);
    try {
      const response = await usersApi.search({
        search: search || undefined,
        skip: users.length,
        limit: USERS_BATCH_SIZE,
      });
      setUsers((current) => [
        ...current,
        ...(response.users as PublicUser[]),
      ]);
      setUserTotal(response.total);
    } finally {
      setIsLoadingMoreUsers(false);
    }
  }, [search, hasMoreUsers, isLoadingUsers, isLoadingMoreUsers, users.length]);

  // ─── INTERSECTION OBSERVER ──────────────────────────────────────────────
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    const canLoadMore = showProjectsGrid ? hasMoreProjects : hasMoreUsers;
    if (!sentinel || !canLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (showProjectsGrid) {
            loadMoreProjects();
          } else {
            loadMoreUsers();
          }
        }
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreProjects, hasMoreUsers, loadMoreProjects, loadMoreUsers, showProjectsGrid]);

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

  const handleCategoryChange = (category: SearchCategory) => {
    setActiveCategory(category);
  };

  const handleTagSelect = (tagId: string) => {
    setSelectedTags([tagId]);
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

      {/* ── Command Palette Search ──────────────────────────────────────── */}
      <SearchCommand
        tags={tags}
        onCategoryChange={handleCategoryChange}
        onSearchChange={setSearch}
        onTagSelect={handleTagSelect}
      />

      {/* ── Projects-only controls ──────────────────────────────────────── */}
      {showProjectsGrid && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="h-11 justify-between gap-3 rounded-xl border-border/80 bg-card/35 px-5 text-sm text-muted-foreground shadow-sm hover:border-primary/45 hover:bg-card"
            onClick={() => setShowFilters((value) => !value)}
            aria-expanded={showFilters}
          >
            <span className="flex items-center gap-2">
              <Filter className="size-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shadow-lg shadow-primary/25">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                showFilters && "rotate-180"
              )}
            />
          </Button>

          <div className="flex h-11 items-center gap-3 rounded-xl border border-border/80 bg-card/35 px-4 shadow-sm">
            <ArrowDownUp className="size-4 text-muted-foreground" />
            <div className="min-w-24">
              <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                <SelectTrigger className="h-auto border-0 bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0">
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

          <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-border/80 bg-card/35 p-1 shadow-sm">
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
                    "size-7 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground",
                    isActive &&
                      "border border-primary/70 bg-primary/15 text-primary shadow-lg shadow-primary/20 hover:bg-primary/20 hover:text-primary"
                  )}
                  onClick={() => setViewMode(item.value)}
                >
                  <Icon className="size-4" />
                </Button>
              );
            })}
          </div>
        </div>
      )}
  </div>
      {/* ── Tag Filter Panel ────────────────────────────────────────────── */}
      {showProjectsGrid && showFilters && (
        <div className="rounded-2xl border border-border/80 bg-card/25 p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
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
                <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/80 bg-background/35 px-4 text-sm font-semibold text-muted-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-foreground">
                  More
                  <ChevronDown className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-56">
                  {overflowTags.map((tag) => (
                    <DropdownMenuItem
                      key={tag.id}
                      className="gap-2 py-2"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {(() => {
                        const Icon = getTagIcon(tag.name);
                        return <Icon className="size-4 text-primary" />;
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

      {showProjectsGrid && (
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          <span>Tip: Use filters to find projects that match your interests</span>
        </div>
      )}

      {/* ── Content Grid ────────────────────────────────────────────────── */}
      {showProjectsGrid ? (
        <>
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
        </>
      ) : (
        <>
          <UserGrid
            users={users}
            isLoading={isLoadingUsers}
            hasActiveFilters={search.length > 0}
            onClearFilters={clearFilters}
          />
          {(isLoadingUsers || isLoadingMoreUsers) && (
            <div className="py-2 text-center text-sm text-muted-foreground">
              Loading users...
            </div>
          )}
        </>
      )}

      {((showProjectsGrid && hasMoreProjects) || (!showProjectsGrid && hasMoreUsers)) && (
        <div ref={loadMoreRef} className="h-8" aria-label="Load more" />
      )}
    </div>
  );
}

// ─── Helpers & Sub-Components ──────────────────────────────────────────────

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
        "h-9 gap-2 rounded-xl border-border/80 bg-background/35 px-4 text-sm font-semibold text-foreground shadow-sm hover:border-primary/50 hover:bg-primary/10",
        active &&
          "border-primary/70 bg-primary/15 text-primary shadow-lg shadow-primary/15 hover:bg-primary/20 hover:text-primary"
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-lg text-primary",
          active && "bg-primary text-primary-foreground"
        )}
      >
        <Icon className="size-3.5" />
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
