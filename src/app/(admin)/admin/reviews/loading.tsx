import { LWTableSkeleton } from "@/components/ui/lw-table-skeleton";

export default function AdminReviewsLoading() {
  return (
    <LWTableSkeleton
      rows={6}
      columns={5}
      headers={["Challenge", "User", "Submitted", "Status", "Actions"]}
    />
  );
}
