import { cn } from "@/lib/utils";
import { LWLoader } from "@/components/ui/lw-loader";

function LWOverlayLoader({
  loading,
  children,
  className,
}: {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
          <LWLoader size="lg" />
        </div>
      )}
    </div>
  );
}

export { LWOverlayLoader };
