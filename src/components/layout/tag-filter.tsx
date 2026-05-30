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
      <div className="flex items-center gap-2 pb-1">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <Badge
              key={tag.id}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer select-none transition-colors hover:opacity-80"
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
