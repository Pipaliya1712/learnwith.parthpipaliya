import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function LWCardSkeleton({
  variant = "default",
  className,
}: {
  variant?: "default" | "project" | "challenge" | "user";
  className?: string;
}) {
  if (variant === "project") {
    return (
      <Card className={cn("overflow-hidden border bg-card h-full flex flex-col", className)}>
        <Skeleton className="h-48 w-full rounded-none" />
        <CardHeader className="p-4 pb-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="space-y-2 pt-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-2">
          <div className="flex gap-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </CardContent>
        <CardFooter className="mt-auto border-t border-border/50 p-4 pt-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-3">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (variant === "challenge") {
    return (
      <Card className={cn("flex flex-col h-full", className)}>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <Skeleton className="h-8 w-full rounded-lg" />
        </CardFooter>
      </Card>
    );
  }

  if (variant === "user") {
    return (
      <Card className={cn("flex items-center gap-4 p-4", className)}>
        <Skeleton className="size-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}

export { LWCardSkeleton };
