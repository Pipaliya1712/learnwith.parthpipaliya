"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
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
import { toast } from "sonner";
import { commentsApi } from "@/lib/api-client";
import { Trash2, ArchiveX } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { LWOverlayLoader } from "@/components/ui/lw-overlay-loader";
import { LWLoader } from "@/components/ui/lw-loader";

export type CommentWithDetails = {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  projects: { name: string } | null;
  profiles: { email: string; display_name: string | null; is_blocked?: boolean } | null;
};

export function AdminCommentTable({
  comments,
  total,
  currentPage,
  pageSize = 10,
  isSuperAdmin,
}: {
  comments: CommentWithDetails[];
  total: number;
  currentPage: number;
  pageSize?: number;
  isSuperAdmin: boolean;
}) {
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteState, setDeleteState] = useState<{
    id: string | null;
    type: "soft" | "hard" | null;
  }>({ id: null, type: null });

  const handleConfirmDelete = async () => {
    if (!deleteState.id || !deleteState.type) return;

    setIsProcessing(true);
    try {
      if (deleteState.type === "soft") {
        await commentsApi.adminSoftDelete(deleteState.id);
        toast.success("Comment soft deleted successfully");
      } else {
        await commentsApi.adminHardDelete(deleteState.id);
        toast.success("Comment permanently deleted");
      }
      setDeleteState({ id: null, type: null });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete comment");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: ColumnDef<CommentWithDetails>[] = [
    {
      key: "project_name",
      header: "Project",
      sortable: true,
      searchable: true,
      searchPlaceholder: "Search project...",
      cell: (row) => (
        <span className="font-medium text-sm">
          {row.projects?.name || "Unknown"}
        </span>
      ),
    },
    {
      key: "user_email",
      header: "User",
      sortable: true,
      searchable: true,
      searchPlaceholder: "Search user email...",
      cell: (row) => (
        <span className="text-sm">
          {row.profiles?.display_name || row.profiles?.email || "Unknown"}
        </span>
      ),
    },
    {
      key: "content",
      header: "Comment",
      sortable: false,
      searchable: true,
      searchPlaceholder: "Search content...",
      cell: (row) => (
        <span className="max-w-xs truncate block text-sm text-muted-foreground">
          {row.content}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      cell: (row) => {
        let text = `Created: ${format(new Date(row.created_at), "MMM d, yyyy")}`;
        if (row.deleted_at) {
          text = `Deleted: ${format(new Date(row.deleted_at), "MMM d, yyyy")}`;
        } else if (row.updated_at) {
          text = `Updated: ${format(new Date(row.updated_at), "MMM d, yyyy")}`;
        }
        return <span className="text-sm text-muted-foreground whitespace-nowrap">{text}</span>;
      },
    },
    {
      key: "status",
      header: "User Status",
      sortable: false,
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Blocked", value: "blocked" },
      ],
      cell: (row) => {
        if (row.profiles?.is_blocked) {
          return <Badge variant="destructive">Blocked</Badge>;
        }
        return <Badge variant="outline">Active</Badge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      cell: (row) => {
        if (!isSuperAdmin) return <span className="text-xs text-muted-foreground">View Only</span>;

        return (
          <div className="flex items-center justify-end gap-2">
            {!row.deleted_at && (
              <Button
                variant="ghost"
                size="icon"
                title="Soft Delete"
                onClick={() => setDeleteState({ id: row.id, type: "soft" })}
              >
                <ArchiveX className="h-4 w-4 text-orange-500" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              title="Hard Delete"
              onClick={() => setDeleteState({ id: row.id, type: "hard" })}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <LWOverlayLoader loading={isProcessing}>
        <DataTable
          columns={columns}
          data={comments}
          total={total}
          pageSize={pageSize}
          currentPage={currentPage}
        />
      </LWOverlayLoader>

      <AlertDialog
        open={deleteState.id !== null}
        onOpenChange={(open) => {
          if (!isProcessing && !open) setDeleteState({ id: null, type: null });
        }}
      >
        <AlertDialogContent>
          {isProcessing ? (
            <div className="flex items-center justify-center py-8">
              <LWLoader size="lg" />
            </div>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteState.type === "soft"
                    ? "This will hide the comment from users, but retain it in the database for auditing."
                    : "This will permanently delete the comment from the database. This action cannot be undone."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
