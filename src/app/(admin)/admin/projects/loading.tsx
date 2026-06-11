import { LWTableSkeleton } from "@/components/ui/lw-table-skeleton";

export default function AdminProjectsLoading() {
  return (
    <LWTableSkeleton
      rows={6}
      columns={5}
      headers={["Project", "Status", "Visibility", "Updated", "Actions"]}
    />
  );
}
