"use client";

import { cn } from "@/lib/utils";

const sizeConfig = {
  sm: { bar: "h-1 w-1.5 rounded-[2px]", gap: "gap-[3px]" },
  md: { bar: "h-2 w-3 rounded-[3px]", gap: "gap-1" },
  lg: { bar: "h-3 w-4 rounded-[4px]", gap: "gap-1.5" },
};

function LWLoader({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const config = sizeConfig[size];

  return (
    <div
      className={cn("inline-flex items-center", config.gap, className)}
      aria-label="Loading"
      role="status"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            "animate-lw-loader bg-primary",
            config.bar
          )}
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

function LWButtonLoader({ className }: { className?: string }) {
  return (
    <LWLoader
      size="sm"
      className={cn("mr-2", className)}
    />
  );
}

export { LWLoader, LWButtonLoader };
