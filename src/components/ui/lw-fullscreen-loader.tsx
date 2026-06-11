import { LWLoader } from "@/components/ui/lw-loader";

function LWFullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <LWLoader size="lg" />
    </div>
  );
}

export { LWFullScreenLoader };
