import { getMySubmissionsServer } from "@/lib/server-api";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, Activity, GitPullRequest, MessageSquare, FileText } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export default async function SubmissionHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { items, total } = await getMySubmissionsServer(params);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "in_progress":
      case "draft":
        return {
          label: "Draft",
          color: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20",
          icon: <Activity className="w-3 h-3 mr-1" />,
        };
      case "submitted":
      case "under_review":
        return {
          label: "Under Review",
          color: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
          icon: <Clock className="w-3 h-3 mr-1" />,
        };
      case "approved":
        return {
          label: "Approved",
          color: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
          icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
        };
      case "rejected":
        return {
          label: "Changes Requested",
          color: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
          icon: <XCircle className="w-3 h-3 mr-1" />,
        };
      default:
        return {
          label: status,
          color: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20",
          icon: null,
        };
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-10 px-4 md:px-6 space-y-8">
      {/* Header Area */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Submission History</h1>
        <p className="text-muted-foreground text-lg">
          Review your past submissions, AI scores, and feedback from reviewers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History ({total})</CardTitle>
          <CardDescription>A complete log of all the code you have submitted for review.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-t border-dashed mt-4">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted">
                <FileText className="size-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">No submissions yet</h2>
              <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
                You haven&apos;t submitted any challenges yet. Start solving challenges to see your history here.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Challenge</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead className="w-[300px]">Feedback</TableHead>
                    <TableHead>Accepted At</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead className="text-right">Links</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((sub: any) => {
                    const config = getStatusConfig(sub.status);
                    const challengeTitle = sub.challenge?.title || "Unknown Challenge";
                    const projectTitle = sub.challenge?.project?.name || "Unknown Project";
                    const prUrl = sub.github_pr_url;
                    
                    return (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          <Link href={`/challenges/${sub.challenge?.slug}`} className="hover:underline">
                            {challengeTitle}
                          </Link>
                          <div className="text-xs text-muted-foreground mt-1">
                            {projectTitle}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${config.color} flex w-fit items-center border-none`} variant="outline">
                            {config.icon}
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sub.status === "draft" || sub.status === "in_progress" ? (
                            <span className="text-muted-foreground text-xs italic">-</span>
                          ) : sub.ai_score !== null && sub.ai_score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${sub.ai_score >= 80 ? 'bg-green-500' : sub.ai_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                              <span className="font-semibold">{sub.ai_score}/100</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {sub.status === "draft" || sub.status === "in_progress" ? (
                            <span className="text-muted-foreground text-xs italic">Not submitted yet</span>
                          ) : sub.ai_feedback ? (
                            <div className="flex items-start gap-2 max-h-20 overflow-y-auto pr-2 custom-scrollbar text-sm text-muted-foreground">
                              <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 text-blue-500/70" />
                              <p className="line-clamp-3 leading-snug">{sub.ai_feedback}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Awaiting review...</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(sub.created_at), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Claimed {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {sub.status === "draft" || sub.status === "in_progress" ? (
                            <span className="text-muted-foreground text-xs italic">-</span>
                          ) : (
                            <>
                              <div className="text-sm">
                                {format(new Date(sub.updated_at), "MMM d, yyyy")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Submitted {formatDistanceToNow(new Date(sub.updated_at), { addSuffix: true })}
                              </div>
                            </>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {prUrl && prUrl !== "pending" && prUrl !== "pending_claim" && (
                            <Link href={prUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline">
                              <GitPullRequest className="mr-1 h-3 w-3" />
                              View PR
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
