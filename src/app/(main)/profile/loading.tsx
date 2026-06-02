import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-8">
      {/* Header Profile Section */}
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="space-y-3 text-center sm:text-left mt-2 flex-1">
          <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
          <div className="flex justify-center sm:justify-start gap-3 mt-4">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </div>
      
      {/* Stats/Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
