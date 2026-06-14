import { getAdminChallengesServer } from "@/lib/server-api";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminChallengeList } from "@/components/admin/admin-challenge-list";

export default async function AdminChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const response = await getAdminChallengesServer(params);
  const challenges = response.items || [];
  const total = response.total || 0;
  const page = response.page || 1;
  const limit = parseInt((params.limit as string) || "12");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground">
            Manage learning tasks, difficulties, and points
          </p>
        </div>
        <Link href="/admin/challenges/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Challenge
          </Button>
        </Link>
      </div>

      <AdminChallengeList
        key={JSON.stringify(params)}
        challenges={challenges}
        total={total}
        currentPage={page}
        pageSize={limit}
      />
    </div>
  );
}
