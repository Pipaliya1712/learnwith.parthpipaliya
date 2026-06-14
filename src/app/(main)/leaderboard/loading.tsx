import { LWPageSkeleton } from "@/components/ui/lw-page-skeleton";
import { LWTableSkeleton } from "@/components/ui/lw-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <LWPageSkeleton className="container mx-auto max-w-5xl py-10 px-4 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-72 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      {/* Top 3 Podium */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 pt-10 pb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full md:w-[280px]">
            <div className="flex flex-col items-center py-6">
              <Skeleton className="size-7 rounded mb-2" />
              <Skeleton className="size-20 rounded-full mb-3" />
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="mt-4 flex gap-6">
                <div className="text-center">
                  <Skeleton className="h-5 w-10 mx-auto" />
                  <Skeleton className="h-3 w-10 mx-auto mt-1" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-5 w-10 mx-auto" />
                  <Skeleton className="h-3 w-10 mx-auto mt-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rankings table */}
      <LWTableSkeleton rows={8} columns={4} headers={["#", "User", "Solved", "Points"]} />
    </LWPageSkeleton>
  );
}
