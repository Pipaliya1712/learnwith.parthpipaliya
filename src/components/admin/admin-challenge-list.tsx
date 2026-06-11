"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { challengesAdminApi } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { LWOverlayLoader } from "@/components/ui/lw-overlay-loader";
import { LWLoader } from "@/components/ui/lw-loader";

interface AdminChallengeListProps {
  challenges: any[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export function AdminChallengeList({
  challenges,
  total,
  currentPage,
  pageSize,
}: AdminChallengeListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(pendingDeleteId);
    try {
      await challengesAdminApi.delete(pendingDeleteId);
      toast.success("Challenge archived successfully");
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to archive challenge");
    } finally {
      setIsDeleting(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const pendingChallenge = challenges.find((c) => c.id === pendingDeleteId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Published</Badge>;
      case "draft":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-none"><Clock className="w-3 h-3 mr-1" /> Draft</Badge>;
      case "archived":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none"><XCircle className="w-3 h-3 mr-1" /> Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "beginner":
        return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Beginner</Badge>;
      case "intermediate":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Intermediate</Badge>;
      case "advanced":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Advanced</Badge>;
      case "expert":
        return <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Expert</Badge>;
      default:
        return <Badge variant="secondary">{diff}</Badge>;
    }
  };

  if (challenges.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No challenges found"
        description="Create your first learning challenge to get started."
      />
    );
  }

  return (
    <>
      <LWOverlayLoader loading={!!isDeleting}>
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Challenge</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {challenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell className="font-medium">
                    <div>{challenge.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{challenge.slug}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {challenge.project?.name || "No Project"}
                  </TableCell>
                  <TableCell>
                    {getDifficultyBadge(challenge.difficulty)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {challenge.points}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(challenge.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/challenges/${challenge.slug}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => openDeleteDialog(challenge.id)}
                        disabled={challenge.status === "archived"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </LWOverlayLoader>

      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        if (!isDeleting) setDeleteDialogOpen(open);
      }}>
        <AlertDialogContent>
          {isDeleting ? (
            <div className="flex items-center justify-center py-8">
              <LWLoader size="lg" />
            </div>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive challenge?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will archive &quot;{pendingChallenge?.title}&quot;. The data will be soft-deleted and can be recovered from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Archive
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
