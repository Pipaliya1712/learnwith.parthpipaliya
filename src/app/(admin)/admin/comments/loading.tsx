import { LWTableSkeleton } from "@/components/ui/lw-table-skeleton";

export default function AdminCommentsLoading() {
  return (
    <LWTableSkeleton
      rows={8}
      columns={4}
      headers={["Content", "User", "Project", "Actions"]}
    />
  );
}
