import type { Bug } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Bug as BugIcon } from "lucide-react";

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
  if (bugs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No bugs reported yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {bugs.map((bug) => {
        const config = severityConfig[bug.severity];
        return (
          <div
            key={bug.id}
            className="rounded-lg border bg-card p-4 space-y-2"
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
  );
}
