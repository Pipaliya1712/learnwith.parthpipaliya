"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ErrorState({
  error,
  reset,
  title = "Something went wrong",
  description,
  className,
}: {
  error?: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
        {description || "An unexpected error occurred. Please try again."}
      </p>
      {reset && (
        <Button
          onClick={reset}
          variant="outline"
          className="mt-6 gap-2"
        >
          <RotateCcw className="size-4" />
          Try again
        </Button>
      )}
    </div>
  );
}

export { ErrorState };
