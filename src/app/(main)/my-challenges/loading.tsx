import { LWPageSkeleton } from "@/components/ui/lw-page-skeleton";
import { LWCardSkeleton } from "@/components/ui/lw-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyChallengesLoading() {
  return (
    <LWPageSkeleton className="container mx-auto max-w-7xl py-10 px-4 md:px-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Challenge grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LWCardSkeleton key={i} variant="challenge" />
        ))}
      </div>
    </LWPageSkeleton>
  );
}
