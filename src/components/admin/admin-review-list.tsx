"use client";

import { useState, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Search, ExternalLink, Bot, AlertCircle, Sparkles, SlidersHorizontal, Check } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [autoAssign, setAutoAssign] = useState(false);

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
    if (score >= 90) return "text-[#4fdbc8] font-bold text-glow-cyan";
    if (score >= 70) return "text-blue-400 font-bold";
    if (score >= 50) return "text-amber-400 font-bold text-glow-amber";
    return "text-destructive font-bold";
  };

  // Client-side filtering to make Bento controls interactive and premium
  const filteredSubmissions = submissions.filter((sub) => {
    const title = sub.challenges?.title?.toLowerCase() || "";
    const name = sub.profiles?.display_name?.toLowerCase() || sub.profiles?.email?.toLowerCase() || "";
    const idStr = `#sub-${sub.id.substring(0, 4)}`.toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || name.includes(searchQuery.toLowerCase()) || idStr.includes(searchQuery.toLowerCase());

    if (!selectedLanguage) return matchesSearch;
    // Check if challenge title or description contains language or tags
    const lang = selectedLanguage.toLowerCase();
    const matchesLang = title.includes(lang) || (sub.challenges?.description?.toLowerCase() || "").includes(lang);
    return matchesSearch && matchesLang;
  });

  return (
    <LWOverlayLoader loading={!!processingId}>
      <div className="space-y-6">
        {/* Header Stats Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card dark:bg-[#1f1f27] border border-border dark:border-outline-variant/30 p-5 rounded-xl">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Review Inbox
              <Badge variant="outline" className="bg-primary/10 dark:bg-[#4cd7f6]/10 text-primary dark:text-[#4cd7f6] border-primary/20 dark:border-[#4cd7f6]/20 font-mono">
                {filteredSubmissions.length} Pending
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Manage and audit incoming technical submissions from students.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-muted dark:bg-[#13131b] border border-border dark:border-outline-variant/40 px-4 py-3 rounded-lg flex items-center gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Awaiting Review</p>
                <p className="text-2xl font-bold font-mono text-foreground">{submissions.length}</p>
              </div>
              <div className="w-px h-8 bg-border dark:bg-outline-variant/40" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-primary dark:text-[#4cd7f6]">Filtered</p>
                <p className="text-2xl font-bold font-mono text-primary dark:text-[#4cd7f6]">{filteredSubmissions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Filters & Interactive Search Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 relative flex items-center bg-card dark:bg-[#1f1f27] border border-border dark:border-outline-variant/30 rounded-xl px-3 py-1">
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              className="bg-transparent border-none outline-none focus:ring-0 text-sm w-full placeholder:text-muted-foreground text-foreground py-2"
              placeholder="Search by ID, user, or challenge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="lg:col-span-5 bg-card dark:bg-[#1f1f27] p-3 rounded-xl border border-border dark:border-outline-variant/30 flex items-center gap-3 overflow-x-auto scrollbar-thin">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase whitespace-nowrap">Filter by:</span>
            <div className="flex gap-1.5">
              {["Python", "Rust", "TypeScript", "SQL"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(selectedLanguage === lang ? null : lang)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                    selectedLanguage === lang
                      ? "bg-primary/10 dark:bg-[#4cd7f6]/15 text-primary dark:text-[#4cd7f6] border-primary/20 dark:border-[#4cd7f6]/40"
                      : "bg-muted dark:bg-[#13131b] text-muted-foreground border-border dark:border-outline-variant/30 hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 bg-card dark:bg-[#1f1f27] px-4 py-3 rounded-xl border border-border dark:border-outline-variant/30 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Auto-Assign</span>
            <button
              onClick={() => {
                setAutoAssign(!autoAssign);
                if (!autoAssign) {
                  toast.success("Auto-assignment enabled");
                }
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoAssign ? "bg-primary dark:bg-[#4cd7f6]" : "bg-muted dark:bg-[#13131b] border-border dark:border-outline-variant/50"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoAssign ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* High-Density Table Container */}
        {filteredSubmissions.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={submissions.length === 0 ? "Inbox Zero!" : "No Matches"}
            description={submissions.length === 0 ? "There are no pending submissions to review." : "Try adjusting your search query or filters."}
          />
        ) : (
          <div className="bg-card dark:bg-[#1f1f27] border border-border dark:border-outline-variant/30 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-muted dark:bg-[#13131b]">
                  <TableRow className="border-b border-border dark:border-outline-variant/30">
                    <TableHead className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider h-11">Reference</TableHead>
                    <TableHead className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider h-11">Candidate / Author</TableHead>
                    <TableHead className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider h-11">Module / Project</TableHead>
                    <TableHead className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider h-11">AI Assistant Score</TableHead>
                    <TableHead className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider text-right h-11">Decisions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border dark:divide-outline-variant/20">
                  {filteredSubmissions.map((sub) => {
                    const subRef = `#SUB-${sub.id.substring(0, 4).toUpperCase()}`;
                    return (
                      <Fragment key={sub.id}>
                        <TableRow className={`hover:bg-muted/50 dark:hover:bg-[#13131b]/30 transition-colors border-b border-border dark:border-outline-variant/20 ${expandedId === sub.id ? "bg-muted dark:bg-[#13131b]/20" : ""}`}>
                          {/* Reference */}
                          <TableCell className="font-mono font-bold text-xs text-primary dark:text-[#4cd7f6]">
                            {subRef}
                          </TableCell>

                          {/* Candidate / Author */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-7 w-7 border border-border dark:border-outline-variant/40">
                                <AvatarImage src={sub.profiles?.avatar_url || ""} />
                                <AvatarFallback className="bg-muted dark:bg-[#13131b] text-[10px] text-primary dark:text-[#c0c1ff]">
                                  {(sub.profiles?.display_name || "U")[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-sm text-foreground">{sub.profiles?.display_name || "Unknown User"}</span>
                            </div>
                          </TableCell>

                          {/* Module / Project */}
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm text-foreground">{sub.challenges?.title}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">
                                  {sub.challenges?.points} XP
                                </span>
                                <span className="text-muted-foreground text-xs">•</span>
                                <a
                                  href={sub.github_pr_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary dark:text-[#4cd7f6] hover:underline"
                                >
                                  View PR <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          </TableCell>

                          {/* AI Assistant Score */}
                          <TableCell>
                            {sub.ai_score ? (
                              <div className="flex items-center gap-2.5">
                                <span className={getScoreColor(sub.ai_score)}>{sub.ai_score}/100</span>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  className="h-6 px-2 text-xs bg-muted dark:bg-[#13131b] border border-border dark:border-[#464554]/30 hover:bg-card dark:hover:bg-[#1f1f27] text-foreground"
                                  onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                                >
                                  <Bot className="h-3 w-3 mr-1 text-primary dark:text-[#4cd7f6]" />
                                  {expandedId === sub.id ? "Hide Feedback" : "View Feedback"}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs italic">Awaiting AI evaluation</span>
                            )}
                          </TableCell>

                          {/* Decisions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 font-semibold text-xs active:scale-95 transition-transform"
                                onClick={() => handleReview(sub.id, "rejected")}
                                disabled={processingId === sub.id}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 font-semibold text-xs bg-gradient-to-r from-[#0ea5e9] to-[#04b4a2] hover:shadow-md hover:shadow-[#0ea5e9]/10 text-white border-none active:scale-95 transition-transform"
                                onClick={() => handleReview(sub.id, "approved")}
                                disabled={processingId === sub.id}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expandable AI Review Details */}
                        {expandedId === sub.id && (
                          <TableRow className="bg-[#13131b]/40">
                            <TableCell colSpan={5} className="p-5 border-t border-b border-[#464554]/30">
                              <div className="flex items-start gap-4">
                                <div className="h-8 w-8 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center border border-[#4cd7f6]/20 shrink-0">
                                  <Bot className="h-5 w-5 text-[#4cd7f6]" />
                                </div>
                                <div className="space-y-2 max-w-none flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-[#4cd7f6] flex items-center gap-1.5">
                                      AI Code Analysis
                                      <span className="text-[10px] font-normal text-muted-foreground">• Automated Report</span>
                                    </h4>
                                  </div>
                                  <div className="prose prose-invert prose-sm text-muted-foreground max-w-none">
                                    {sub.ai_feedback ? (
                                      <ReactMarkdown>{sub.ai_feedback}</ReactMarkdown>
                                    ) : (
                                      <p className="italic text-xs text-muted-foreground">No detailed feedback notes generated.</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {/* Table Footer */}
            <div className="p-4 bg-[#13131b] border-t border-[#464554]/30 flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {filteredSubmissions.length} of {submissions.length} awaiting reviews</span>
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-white bg-[#1f1f27] px-2 py-1 rounded border border-[#464554]/30">
                Audited Sandbox v2.0
              </span>
            </div>
          </div>
        )}
      </div>
    </LWOverlayLoader>
  );
}

