"use client";

import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/types";

export function TagBadge({ tag }: { tag: Tag }) {
  return (
    <Badge variant="secondary" className="text-xs font-normal">
      {tag.name}
    </Badge>
  );
}
