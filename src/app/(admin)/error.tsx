"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function AdminError({
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
        title="Admin error"
        description="Something went wrong in the admin panel. Please try again or contact support."
      />
    </div>
  );
}
