"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorState
        error={error}
        reset={reset}
        title="Something went wrong"
        description="An unexpected error occurred while loading this page. Please try again."
      />
    </div>
  );
}
