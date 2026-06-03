"use client";

import { useState } from "react";
import type { Improvement } from "@/types";
import { ArrowUpCircle } from "lucide-react";
import {
  RecordPageSkeleton,
  RecordPagination,
} from "@/components/project/record-pagination";

const ITEMS_PER_PAGE = 5;

export function ImprovementList({ improvements }: { improvements: Improvement[] }) {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  if (improvements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No improvements documented yet.
      </p>
    );
  }

  const totalPages = Math.ceil(improvements.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const pageImprovements = improvements.slice(start, start + ITEMS_PER_PAGE);

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page || nextPage < 1 || nextPage > totalPages) return;

    setIsLoading(true);
    window.setTimeout(() => {
      setPage(nextPage);
      setIsLoading(false);
    }, 260);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-thin">
        {isLoading ? (
          <RecordPageSkeleton />
        ) : (
          <div className="space-y-4">
            {pageImprovements.map((improvement) => (
              <div
                key={improvement.id}
                className="space-y-2 rounded-xl border bg-background/35 p-4 shadow-inner shadow-black/10 transition-colors hover:border-primary/35"
              >
                <div className="flex items-start gap-3">
                  <ArrowUpCircle className="h-5 w-5 text-info mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{improvement.title}</h4>
                    {improvement.description && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {improvement.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 pt-4 mt-auto border-t">
        <RecordPagination
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
