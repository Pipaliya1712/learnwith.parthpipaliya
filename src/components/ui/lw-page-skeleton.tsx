import { cn } from "@/lib/utils";

function LWPageSkeleton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
}

export { LWPageSkeleton };
