import { LWPageSkeleton } from "@/components/ui/lw-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function UserProfileLoading() {
  return (
    <LWPageSkeleton className="mx-auto max-w-4xl space-y-8 p-6 md:p-8">
      {/* Header Profile Section */}
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <Skeleton className="size-24 rounded-full" />
        <div className="space-y-3 text-center sm:text-left flex-1">
          <Skeleton className="h-7 w-40 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-56 mx-auto sm:mx-0" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comments section */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </LWPageSkeleton>
  );
}
