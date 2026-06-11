import { LWTableSkeleton } from "@/components/ui/lw-table-skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <LWTableSkeleton rows={5} columns={5} />
    </div>
  );
}
