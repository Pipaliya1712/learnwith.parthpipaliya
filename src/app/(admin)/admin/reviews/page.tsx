import { getPendingSubmissionsServer } from "@/lib/server-api";
import { AdminReviewList } from "@/components/admin/admin-review-list";
import { CheckSquare } from "lucide-react";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const response = await getPendingSubmissionsServer(params);
  const submissions = response.items || [];
  const total = response.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
            <p className="text-muted-foreground">
              Review and approve pending challenge submissions
            </p>
          </div>
        </div>
        <div className="text-sm font-medium bg-muted px-3 py-1.5 rounded-md">
          {total} Pending
        </div>
      </div>

      <AdminReviewList
        key={JSON.stringify(params)}
        submissions={submissions}
        total={total}
      />
    </div>
  );
}
