import { LWPageSkeleton } from "@/components/ui/lw-page-skeleton";
import { LWCardSkeleton } from "@/components/ui/lw-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LWPageSkeleton className="mx-auto max-w-6xl px-4 py-12 space-y-6">
      <div className="space-y-4 text-center">
        <Skeleton className="h-12 w-72 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="flex gap-4 justify-center">
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <LWCardSkeleton key={i} variant="project" />
        ))}
      </div>
    </LWPageSkeleton>
  );
}
