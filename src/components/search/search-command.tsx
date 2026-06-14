"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Clock,
  Trash2,
  FolderOpen,
  User,
  Zap,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { projectsApi, usersApi } from "@/lib/api-client";
import type { Tag, PublicUser } from "@/types";

// ─── Types ──────────────────────────────────────────────────────────────────

type SearchCategory = "all" | "projects" | "users" | "technologies";

type FlatItem =
  | { type: "project"; name: string; slug: string; summary: string }
  | { type: "user"; id: string; display_name: string | null; avatar_url: string | null; role: string }
  | { type: "technology"; id: string; name: string }
  | { type: "recent"; query: string }
  | { type: "trending"; id: string; name: string }
  | { type: "suggested_user"; id: string; display_name: string | null; avatar_url: string | null; role: string };

interface SearchCommandProps {
  tags: Tag[];
  onCategoryChange: (category: SearchCategory) => void;
  onSearchChange: (query: string) => void;
  onTagSelect: (tagId: string) => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "learnwith_recent_searches";
const MAX_RECENT = 5;
const CATEGORIES: { key: SearchCategory; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: Search },
  { key: "projects", label: "Projects", icon: FolderOpen },
  { key: "users", label: "Users", icon: User },
  { key: "technologies", label: "Technologies", icon: Zap },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecent(q: string) {
  if (!q.trim()) return;
  const recent = getRecent().filter((r) => r !== q);
  recent.unshift(q);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function clearRecent() {
  localStorage.removeItem(STORAGE_KEY);
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-primary/25 text-foreground px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SearchCommand({
  tags,
  onCategoryChange,
  onSearchChange,
  onTagSelect,
}: SearchCommandProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchCategory>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Live search results
  const [resultProjects, setResultProjects] = useState<FlatItem[]>([]);
  const [resultUsers, setResultUsers] = useState<FlatItem[]>([]);
  const [resultTechs, setResultTechs] = useState<FlatItem[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<FlatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFetchedSuggested = useRef(false);

  const debouncedQuery = useDebouncedValue(query, 300);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecent());
  }, []);

  // Fetch suggested users on first open
  useEffect(() => {
    if (isOpen && !hasFetchedSuggested.current) {
      hasFetchedSuggested.current = true;
      usersApi
        .search({ limit: 5 })
        .then((res) => {
          setSuggestedUsers(
            (res.users as PublicUser[]).map(
              (u) =>
                ({
                  type: "suggested_user" as const,
                  ...u,
                }) satisfies FlatItem
            )
          );
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Fetch live results when query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResultProjects([]);
      setResultUsers([]);
      setResultTechs([]);
      return;
    }

    setIsLoading(true);

    const matchedTechs: FlatItem[] = tags
      .filter((t) => t.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
      .slice(0, 5)
      .map((t) => ({ type: "technology" as const, id: t.id, name: t.name }));
    setResultTechs(matchedTechs);

    Promise.all([
      projectsApi
        .dashboard({ search: debouncedQuery, limit: 5 })
        .catch(() => ({ projects: [], total: 0, page: 1 })),
      usersApi
        .search({ search: debouncedQuery, limit: 5 })
        .catch(() => ({ users: [], total: 0 })),
    ])
      .then(([projRes, userRes]) => {
        setResultProjects(
          (projRes.projects as { id: string; name: string; slug: string; summary: string }[]).map(
            (p) => ({
              type: "project" as const,
              name: p.name,
              slug: p.slug,
              summary: p.summary,
            })
          )
        );
        setResultUsers(
          (userRes.users as PublicUser[]).map(
            (u) =>
              ({
                type: "user" as const,
                ...u,
              }) as FlatItem
          )
        );
      })
      .finally(() => setIsLoading(false));
  }, [debouncedQuery, tags]);

  // Propagate search to parent on debounced change
  useEffect(() => {
    onSearchChange(debouncedQuery);
  }, [debouncedQuery, onSearchChange]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Ctrl+K shortcut
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Build flat list for keyboard nav
  const allItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    if (debouncedQuery) {
      const showProjects = activeTab === "all" || activeTab === "projects";
      const showUsers = activeTab === "all" || activeTab === "users";
      const showTechs = activeTab === "all" || activeTab === "technologies";
      if (showProjects) items.push(...resultProjects);
      if (showUsers) items.push(...resultUsers);
      if (showTechs) items.push(...resultTechs);
    } else {
      recentSearches.forEach((s) => items.push({ type: "recent", query: s }));
      tags.slice(0, 7).forEach((t) =>
        items.push({ type: "trending", id: t.id, name: t.name })
      );
      items.push(...suggestedUsers);
    }
    return items;
  }, [debouncedQuery, activeTab, resultProjects, resultUsers, resultTechs, recentSearches, tags, suggestedUsers]);

  // Reset selection on changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery, activeTab]);

  // Handle item selection
  const handleSelectItem = useCallback(
    (item: FlatItem) => {
      switch (item.type) {
        case "project":
          router.push(`/dashboard/${item.slug}`);
          break;
        case "user":
          router.push(`/profile/${item.id}`);
          break;
        case "technology":
          onTagSelect(item.id);
          setQuery(item.name);
          break;
        case "recent":
          setQuery(item.query);
          break;
        case "trending":
          onTagSelect(item.id);
          setQuery(item.name);
          break;
        case "suggested_user":
          router.push(`/profile/${item.id}`);
          break;
      }
      addRecent(item.type === "project" ? item.name : item.type === "recent" ? item.query : item.type === "trending" || item.type === "technology" ? item.name : item.display_name || "");
      setRecentSearches(getRecent());
      setIsOpen(false);
    },
    [router, onTagSelect]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && allItems[selectedIndex]) {
          handleSelectItem(allItems[selectedIndex]);
        } else if (query.trim()) {
          addRecent(query.trim());
          setRecentSearches(getRecent());
          setIsOpen(false);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    [selectedIndex, allItems, query, handleSelectItem]
  );

  const handleTabChange = (tab: SearchCategory) => {
    setActiveTab(tab);
    onCategoryChange(tab);
  };

  // Trending tech chips
  const trendingTechs = tags.slice(0, 7);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative">
      {/* ── Search Input ───────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative flex items-center rounded-2xl border backdrop-blur-xl shadow-lg transition-all duration-300",
          isOpen
            ? "border-primary/60 bg-card/60 shadow-[0_0_30px_rgba(59,130,246,0.12)]"
            : "border-primary/35 bg-card/45 shadow-primary/5 hover:border-primary/50"
        )}
      >
        <Search className="pointer-events-none absolute left-5 size-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search projects, users, technologies..."
          className="h-14 w-full bg-transparent pl-14 pr-28 text-lg text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-xl"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              onSearchChange("");
            }}
            className="absolute right-[88px] top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
        <kbd className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 hidden items-center gap-1 rounded-lg border border-border/40 bg-muted/50 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </div>

      {/* ── Search Dropdown ────────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-2xl shadow-black/20 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border/40 px-3 py-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleTabChange(cat.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto overscroll-contain p-2 scrollbar-thin">
            {debouncedQuery ? (
              /* ── Live Search Results ────────────────────────────── */
              isLoading ? (
                <LoadingSkeleton />
              ) : allItems.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-1">
                  {/* Projects section */}
                  {shouldShow("projects", activeTab) && resultProjects.length > 0 && (
                    <ResultSection title="Projects" icon={FolderOpen}>
                      {resultProjects.map((item, i) => {
                        const flatIdx = getFlatIndex(allItems, item, i, "projects", activeTab);
                        const p = item as Extract<FlatItem, { type: "project" }>;
                        return (
                          <ResultRow
                            key={`p-${i}`}
                            isSelected={selectedIndex === flatIdx}
                            onClick={() => handleSelectItem(item)}
                            onMouseEnter={() => setSelectedIndex(flatIdx)}
                          >
                            <FolderOpen className="size-4 shrink-0 text-primary/70" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {highlightMatch(p.name, debouncedQuery)}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {p.summary}
                              </p>
                            </div>
                            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/50" />
                          </ResultRow>
                        );
                      })}
                    </ResultSection>
                  )}

                  {/* Users section */}
                  {shouldShow("users", activeTab) && resultUsers.length > 0 && (
                    <ResultSection title="Users" icon={User}>
                      {resultUsers.map((item, i) => {
                        const flatIdx = getFlatIndex(allItems, item, i, "users", activeTab);
                        const displayName = item.type === "user" ? item.display_name || "Anonymous" : "";
                        const avatarUrl = item.type === "user" ? item.avatar_url : null;
                        const role = item.type === "user" ? item.role : "";
                        return (
                          <ResultRow
                            key={`u-${i}`}
                            isSelected={selectedIndex === flatIdx}
                            onClick={() => handleSelectItem(item)}
                            onMouseEnter={() => setSelectedIndex(flatIdx)}
                          >
                            <Avatar className="size-7 shrink-0">
                              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                              <AvatarFallback className="text-[10px]">
                                {displayName[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {highlightMatch(displayName, debouncedQuery)}
                              </p>
                              <p className="text-xs capitalize text-muted-foreground">{role}</p>
                            </div>
                            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/50" />
                          </ResultRow>
                        );
                      })}
                    </ResultSection>
                  )}

                  {/* Technologies section */}
                  {shouldShow("technologies", activeTab) && resultTechs.length > 0 && (
                    <ResultSection title="Technologies" icon={Zap}>
                      {resultTechs.map((item, i) => {
                        const flatIdx = getFlatIndex(allItems, item, i, "technologies", activeTab);
                        const t = item as Extract<FlatItem, { type: "technology" }>;
                        return (
                          <ResultRow
                            key={`t-${i}`}
                            isSelected={selectedIndex === flatIdx}
                            onClick={() => handleSelectItem(item)}
                            onMouseEnter={() => setSelectedIndex(flatIdx)}
                          >
                            <Zap className="size-4 shrink-0 text-amber-500" />
                            <p className="min-w-0 flex-1 truncate text-sm font-medium">
                              {highlightMatch(t.name, debouncedQuery)}
                            </p>
                            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/50" />
                          </ResultRow>
                        );
                      })}
                    </ResultSection>
                  )}
                </div>
              )
            ) : (
              /* ── Default View (No Query) ────────────────────────── */
              <div className="space-y-4 py-1">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Recent
                      </span>
                      <button
                        onClick={() => {
                          clearRecent();
                          setRecentSearches([]);
                        }}
                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Trash2 className="size-3" />
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {recentSearches.map((search, i) => {
                        const flatIdx = allItems.findIndex(
                          (it) => it.type === "recent" && it.query === search
                        );
                        return (
                          <ResultRow
                            key={search}
                            isSelected={selectedIndex === flatIdx}
                            onClick={() => {
                              setQuery(search);
                              addRecent(search);
                            }}
                            onMouseEnter={() => setSelectedIndex(flatIdx)}
                          >
                            <Clock className="size-4 shrink-0 text-muted-foreground/60" />
                            <span className="truncate text-sm">{search}</span>
                            <ArrowRight className="ml-auto size-3.5 shrink-0 text-muted-foreground/40" />
                          </ResultRow>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Trending Technologies */}
                {trendingTechs.length > 0 && (
                  <div>
                    <span className="block px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Trending Technologies
                    </span>
                    <div className="flex flex-wrap gap-2 px-3 pb-1">
                      {trendingTechs.map((tag) => {
                        const flatIdx = allItems.findIndex(
                          (it) => it.type === "trending" && it.id === tag.id
                        );
                        return (
                          <button
                            key={tag.id}
                            onClick={() => {
                              onTagSelect(tag.id);
                              setQuery(tag.name);
                              addRecent(tag.name);
                              setRecentSearches(getRecent());
                              setIsOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(flatIdx)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-150",
                              selectedIndex === flatIdx
                                ? "border-primary/50 bg-primary/10 text-primary"
                                : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                            )}
                          >
                            <Zap className="size-3 text-amber-500" />
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested Users */}
                {suggestedUsers.length > 0 && (
                  <div>
                    <span className="block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Suggested Users
                    </span>
                    <div className="space-y-0.5">
                      {suggestedUsers.map((item, i) => {
                        const su = item as Extract<FlatItem, { type: "suggested_user" }>;
                        const displayName = su.display_name || "Anonymous";
                        const avatarUrl = su.avatar_url;
                        const role = su.role;
                        const flatIdx = allItems.findIndex(
                          (it) =>
                            it.type === "suggested_user" && it.id === su.id
                        );
                        return (
                          <ResultRow
                            key={`su-${i}`}
                            isSelected={selectedIndex === flatIdx}
                            onClick={() => handleSelectItem(item)}
                            onMouseEnter={() => setSelectedIndex(flatIdx)}
                          >
                            <Avatar className="size-7 shrink-0">
                              {avatarUrl && (
                                <AvatarImage src={avatarUrl} alt={displayName} />
                              )}
                              <AvatarFallback className="text-[10px]">
                                {displayName[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {displayName}
                              </p>
                              <p className="text-xs capitalize text-muted-foreground">
                                {role}
                              </p>
                            </div>
                            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/40" />
                          </ResultRow>
                        );
                      })}
                    </div>
                  </div>
                )}

                {recentSearches.length === 0 && suggestedUsers.length === 0 && (
                  <div className="px-3 py-8 text-center">
                    <Search className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Start typing to search...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t border-border/40 px-4 py-2">
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border/40 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border/40 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border/40 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">esc</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function ResultSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-1">
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon className="size-3.5 text-muted-foreground/60" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function ResultRow({
  isSelected,
  onClick,
  onMouseEnter,
  children,
}: {
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 cursor-pointer",
        isSelected
          ? "bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/20"
          : "text-foreground hover:bg-muted/50"
      )}
    >
      {children}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-3">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-2">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-3 py-10 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/50">
        <Search className="size-6 text-muted-foreground/50" />
      </div>
      <p className="text-base font-semibold text-foreground">No results found</p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Try searching for a project, technology, or contributor.
      </p>
    </div>
  );
}

// ─── Utility: Category filtering & index mapping ───────────────────────────

function shouldShow(
  section: "projects" | "users" | "technologies",
  activeTab: SearchCategory
): boolean {
  return activeTab === "all" || activeTab === section;
}

function getFlatIndex(
  allItems: FlatItem[],
  _item: FlatItem,
  sectionIndex: number,
  section: "projects" | "users" | "technologies",
  activeTab: SearchCategory
): number {
  let offset = 0;
  if (section === "users") {
    if (shouldShow("projects", activeTab)) {
      offset += allItems.filter((i) => i.type === "project").length;
    }
  } else if (section === "technologies") {
    if (shouldShow("projects", activeTab)) {
      offset += allItems.filter((i) => i.type === "project").length;
    }
    if (shouldShow("users", activeTab)) {
      offset += allItems.filter((i) => i.type === "user").length;
    }
  }
  return offset + sectionIndex;
}
