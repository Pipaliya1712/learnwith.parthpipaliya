"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type RecordPaginationProps = {
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

export function RecordPagination({
  page,
  totalPages,
  isLoading,
  onPageChange,
}: RecordPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Record pagination"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={page === 1 || isLoading}
        onClick={() => onPageChange(page - 1)}
        className="gap-1 text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        Previous
      </Button>

      <div className="flex flex-wrap items-center gap-1">
        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            variant={pageNumber === page ? "outline" : "ghost"}
            size="icon"
            disabled={isLoading}
            aria-current={pageNumber === page ? "page" : undefined}
            onClick={() => onPageChange(pageNumber)}
            className={`size-9 transition-all hover:-translate-y-0.5 ${
              pageNumber === page
                ? "border-primary/45 bg-primary/15 text-primary shadow-sm shadow-primary/15"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {pageNumber}
          </Button>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={page === totalPages || isLoading}
        onClick={() => onPageChange(page + 1)}
        className="gap-1 text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary"
      >
        Next
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

export function RecordPageSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading records">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="space-y-3 rounded-xl border bg-background/35 p-4 shadow-inner shadow-black/10"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 size-5 rounded-full shimmer" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-44 rounded-full shimmer" />
              <div className="h-3 w-full rounded-full shimmer" />
              <div className="h-3 w-2/3 rounded-full shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
