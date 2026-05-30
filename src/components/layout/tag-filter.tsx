"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Tag } from "@/types";

interface TagFilterProps {
  tags: Tag[];
  selectedTags: string[];
  onToggle: (tagId: string) => void;
  className?: string;
}

export function TagFilter({
  tags,
  selectedTags,
  onToggle,
  className,
}: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <ScrollArea className={`w-full whitespace-nowrap ${className ?? ""}`}>
      <div className="flex items-center gap-2 pb-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <Badge
              key={tag.id}
              variant={isSelected ? "default" : "outline"}
              className={`h-7 cursor-pointer select-none rounded-full px-3 text-sm font-semibold shadow-sm transition-colors hover:opacity-100 ${
                isSelected
                  ? "border-primary/40 bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border/80 bg-background/40 text-foreground hover:border-primary/50 hover:bg-primary/10"
              }`}
              onClick={() => onToggle(tag.id)}
            >
              {tag.name}
            </Badge>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
