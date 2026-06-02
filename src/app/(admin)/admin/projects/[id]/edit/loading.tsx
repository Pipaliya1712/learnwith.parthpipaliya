import { Skeleton } from "@/components/ui/skeleton";

export default function EditProjectLoading() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 p-6">
      {/* Title Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stepper Header Skeleton */}
      <div className="flex items-center justify-between relative px-4 mb-12">
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full overflow-hidden z-0" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="relative z-10 flex flex-col items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-3 w-16 absolute -bottom-6 hidden sm:block" />
          </div>
        ))}
      </div>

      {/* Main Form Content Skeleton */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-md">
        <div className="flex flex-col space-y-1.5 p-6">
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6 pt-0 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons Skeleton */}
      <div className="mt-8 flex items-center justify-between border-t pt-6">
        <Skeleton className="h-10 w-24" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}
