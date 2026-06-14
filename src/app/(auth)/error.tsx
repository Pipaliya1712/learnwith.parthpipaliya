"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Authentication error"
      description="Something went wrong during authentication. Please try again."
    />
  );
}
