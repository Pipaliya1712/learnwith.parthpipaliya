"use client";

import { useState, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Search, ExternalLink, Bot, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { submissionsAdminApi } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import { EmptyState } from "@/components/ui/empty-state";
import { LWOverlayLoader } from "@/components/ui/lw-overlay-loader";

interface AdminReviewListProps {
  submissions: any[];
  total: number;
}

export function AdminReviewList({
  submissions,
  total,
}: AdminReviewListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    try {
      setProcessingId(id);
      await submissionsAdminApi.review(id, { status });
      toast.success(`Submission ${status} successfully`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} submission`);
    } finally {
      setProcessingId(null);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 90) return "text-green-500 font-bold";
    if (score >= 70) return "text-blue-500 font-bold";
    if (score >= 50) return "text-yellow-500 font-bold";
    return "text-red-500 font-bold";
  };

  if (submissions.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Inbox Zero!"
        description="There are no pending submissions to review."
      />
    );
  }

  return (
    <LWOverlayLoader loading={!!processingId}>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Challenge</TableHead>
              <TableHead>Links</TableHead>
              <TableHead>AI Score</TableHead>
              <TableHead className="text-right">Decisions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub) => (
              <Fragment key={sub.id}>
                <TableRow className={expandedId === sub.id ? "bg-muted/30 border-b-0" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={sub.profiles?.avatar_url || ""} />
                        <AvatarFallback>{sub.profiles?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{sub.profiles?.username || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{sub.challenges?.title}</div>
                    <Badge variant="secondary" className="mt-1">{sub.challenges?.points} Points</Badge>
                  </TableCell>
                  <TableCell>
                    <a
                      href={sub.github_pr_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      View PR <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    {sub.ai_score ? (
                      <div className="flex items-center gap-2">
                        <span className={getScoreColor(sub.ai_score)}>{sub.ai_score}/100</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                        >
                          <Bot className="h-3 w-3 mr-1" />
                          {expandedId === sub.id ? "Hide details" : "View details"}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No AI review</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleReview(sub.id, "rejected")}
                        disabled={processingId === sub.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleReview(sub.id, "approved")}
                        disabled={processingId === sub.id}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expandable AI Review Details */}
                {expandedId === sub.id && sub.ai_feedback && (
                  <TableRow className="bg-muted/10">
                    <TableCell colSpan={5} className="p-0 border-t-0 border-b">
                      <div className="p-6 text-sm">
                        <div className="flex items-start gap-3">
                          <Bot className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <h4 className="m-0 mb-2 font-semibold text-blue-800 dark:text-blue-400">AI Review Feedback</h4>
                            <div className="text-muted-foreground">
                              <ReactMarkdown>{sub.ai_feedback}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </LWOverlayLoader>
  );
}
