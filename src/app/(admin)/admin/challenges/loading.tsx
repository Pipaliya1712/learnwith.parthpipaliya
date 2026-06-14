import { LWTableSkeleton } from "@/components/ui/lw-table-skeleton";

export default function AdminChallengesLoading() {
  return (
    <LWTableSkeleton
      rows={6}
      columns={5}
      headers={["Title", "Project", "Difficulty", "Status", "Actions"]}
    />
  );
}
