"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProjectImage } from "@/types";
import { cleanImageUrl } from "@/lib/utils";

export function ImageGallery({ images }: { images: ProjectImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const sortedImages = [...images].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0)
  );

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted group">
        <Image
          src={cleanImageUrl(sortedImages[selectedIndex].image_url)}
          alt={sortedImages[selectedIndex].alt_text || "Project screenshot"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
        {sortedImages.length > 1 && (
          <>
            <div className="absolute inset-y-0 left-0 flex items-center px-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={handlePrevious}
                className="h-8 w-8 rounded-full bg-background/80 flex items-center justify-center backdrop-blur hover:bg-background shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={handleNext}
                className="h-8 w-8 rounded-full bg-background/80 flex items-center justify-center backdrop-blur hover:bg-background shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {sortedImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(i)}
              className={`relative h-10 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                i === selectedIndex
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              <Image
                src={cleanImageUrl(img.image_url)}
                alt={img.alt_text || `Screenshot ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
