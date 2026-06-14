import { getPendingSubmissionsServer } from "@/lib/server-api";
import { AdminReviewList } from "@/components/admin/admin-review-list";

export default async function AdminReviewQueuePage({
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Review Queue</h1>
        <p className="text-muted-foreground text-sm">
          Review student challenge submissions. Assess code quality, architectural decisions, and verify test passes.
        </p>
      </div>

      <AdminReviewList submissions={submissions} total={total} />
    </div>
  );
}
