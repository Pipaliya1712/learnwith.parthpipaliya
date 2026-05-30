"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types";

interface TagFilterProps {
  tags: Tag[];
  selectedTags: string[];
  onToggle: (tagId: string) => void;
  onClear?: () => void;
  className?: string;
}

export function TagFilter({
  tags,
  selectedTags,
  onToggle,
  onClear,
  className,
}: TagFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const speedRef = useRef(0);

  const stopAutoScroll = () => {
    speedRef.current = 0;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const stepAutoScroll = () => {
    const node = scrollRef.current;
    const speed = speedRef.current;

    if (!node || speed === 0) {
      frameRef.current = null;
      return;
    }

    node.scrollLeft += speed;
    frameRef.current = requestAnimationFrame(stepAutoScroll);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const node = scrollRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const edgeSize = Math.min(110, rect.width * 0.25);
    const leftDistance = event.clientX - rect.left;
    const rightDistance = rect.right - event.clientX;

    if (leftDistance < edgeSize) {
      const strength = (edgeSize - leftDistance) / edgeSize;
      speedRef.current = -Math.ceil(strength * 14);
    } else if (rightDistance < edgeSize) {
      const strength = (edgeSize - rightDistance) / edgeSize;
      speedRef.current = Math.ceil(strength * 14);
    } else {
      stopAutoScroll();
      return;
    }

    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(stepAutoScroll);
    }
  };

  useEffect(() => stopAutoScroll, []);

  if (tags.length === 0) return null;

  return (
    <div className={cn("group/filter relative min-w-0 flex-1", className)}>
      <div
        ref={scrollRef}
        className="project-type-scroll w-full overflow-hidden whitespace-nowrap"
        onMouseMove={handleMouseMove}
        onMouseLeave={stopAutoScroll}
      >
        <div className="flex w-max items-center gap-2 pb-1">
          <Badge
            variant={selectedTags.length === 0 ? "default" : "outline"}
            className={cn(
              "h-10 cursor-pointer select-none rounded-lg px-4 text-sm font-semibold shadow-sm transition-all hover:opacity-100",
              selectedTags.length === 0
                ? "border-primary/40 bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90"
                : "border-border/80 bg-background/45 text-foreground hover:border-primary/50 hover:bg-primary/10"
            )}
            onClick={onClear}
          >
            All
          </Badge>
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "h-10 cursor-pointer select-none rounded-lg px-4 text-sm font-semibold shadow-sm transition-all hover:opacity-100",
                  isSelected
                    ? "border-primary/40 bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90"
                    : "border-border/80 bg-background/45 text-foreground hover:border-primary/50 hover:bg-primary/10"
                )}
                onClick={() => onToggle(tag.id)}
              >
                {tag.name}
              </Badge>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent opacity-0 transition-opacity group-hover/filter:opacity-100" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
