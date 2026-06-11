import { LWTableSkeleton } from "@/components/ui/lw-table-skeleton";

export default function AdminUsersLoading() {
  return (
    <LWTableSkeleton
      rows={8}
      columns={5}
      headers={["User", "Email", "Role", "Status", "Actions"]}
    />
  );
}
