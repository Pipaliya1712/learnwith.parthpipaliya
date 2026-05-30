import type { Improvement } from "@/types";
import { ArrowUpCircle } from "lucide-react";

export function ImprovementList({ improvements }: { improvements: Improvement[] }) {
  if (improvements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No improvements documented yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {improvements.map((improvement) => (
        <div
          key={improvement.id}
          className="rounded-lg border bg-card p-4 space-y-2"
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
  );
}
