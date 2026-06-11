import { LWPageSkeleton } from "@/components/ui/lw-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsLoading() {
  return (
    <LWPageSkeleton className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Personal Info Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar + Upload */}
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Separator />
          {/* Display Name */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="size-8 rounded" />
          </div>
          <Separator />
          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="size-8 rounded" />
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-5 w-36" />
        </CardContent>
      </Card>
    </LWPageSkeleton>
  );
}
