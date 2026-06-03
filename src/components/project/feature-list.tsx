"use client";

import { useState } from "react";
import type { Feature } from "@/types";
import { CheckCircle2 } from "lucide-react";
import {
  RecordPageSkeleton,
  RecordPagination,
} from "@/components/project/record-pagination";

const ITEMS_PER_PAGE = 5;

export function FeatureList({ features }: { features: Feature[] }) {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  if (features.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No features documented yet.
      </p>
    );
  }

  const totalPages = Math.ceil(features.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const pageFeatures = features.slice(start, start + ITEMS_PER_PAGE);

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
            {pageFeatures.map((feature) => (
              <div
                key={feature.id}
                className="space-y-2 rounded-xl border bg-background/35 p-4 shadow-inner shadow-black/10 transition-colors hover:border-primary/35"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {feature.description}
                    </p>
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
