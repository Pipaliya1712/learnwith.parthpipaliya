import type { Feature } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export function FeatureList({ features }: { features: Feature[] }) {
  if (features.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No features documented yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <div
          key={feature.id}
          className="rounded-lg border bg-card p-4 space-y-2"
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
  );
}
