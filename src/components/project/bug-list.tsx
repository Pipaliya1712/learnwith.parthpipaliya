"use client";

import { useState } from "react";
import type { Bug } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Bug as BugIcon } from "lucide-react";
import {
  RecordPageSkeleton,
  RecordPagination,
} from "@/components/project/record-pagination";

const ITEMS_PER_PAGE = 5;

const severityConfig: Record<
  Bug["severity"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  low: { label: "Low", variant: "secondary" },
  medium: { label: "Medium", variant: "default" },
  high: { label: "High", variant: "destructive" },
  critical: { label: "Critical", variant: "destructive" },
};

export function BugList({ bugs }: { bugs: Bug[] }) {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  if (bugs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No bugs reported yet.</p>
    );
  }

  const totalPages = Math.ceil(bugs.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const pageBugs = bugs.slice(start, start + ITEMS_PER_PAGE);

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page || nextPage < 1 || nextPage > totalPages) return;

    setIsLoading(true);
    window.setTimeout(() => {
      setPage(nextPage);
      setIsLoading(false);
    }, 260);
  };

  return (
    <>
      {isLoading ? (
        <RecordPageSkeleton />
      ) : (
        <div className="space-y-4">
          {pageBugs.map((bug) => {
            const config = severityConfig[bug.severity];
            return (
              <div
                key={bug.id}
                className="space-y-2 rounded-xl border bg-background/35 p-4 shadow-inner shadow-black/10 transition-colors hover:border-primary/35"
              >
                <div className="flex items-start gap-3">
                  <BugIcon className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{bug.title}</h4>
                      <Badge variant={config.variant} className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                    {bug.description && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {bug.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <RecordPagination
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={handlePageChange}
      />
    </>
  );
}
