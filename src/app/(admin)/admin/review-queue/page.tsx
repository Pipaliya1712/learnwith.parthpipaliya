"use client";

import React, { useEffect, useState } from "react";
import { submissionsApi } from "@/lib/api-client";
import type { Submission } from "@/types";
import { GitPullRequest, Code, Award, Loader2, Sparkles, AlertCircle, FileText, CheckCircle2, XCircle, Search, ClipboardList } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function ReviewQueuePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  
  // Review form states
  const [aiScore, setAiScore] = useState<number>(80);
  const [aiFeedback, setAiFeedback] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await submissionsApi.getPendingReviews();
      setSubmissions(data.items || []);
    } catch (err) {
      console.error("Error loading review queue:", err);
      toast.error("Failed to load review queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const openReviewModal = (sub: Submission) => {
    setSelectedSub(sub);
    setAiScore(sub.ai_score || 80);
    setAiFeedback(sub.ai_feedback || "");
  };

  const handleReviewSubmit = async (status: "approved" | "rejected") => {
    if (!selectedSub) return;

    try {
      setSubmittingReview(true);
      await submissionsApi.review(selectedSub.id, {
        status,
        ai_score: aiScore,
        ai_feedback: aiFeedback,
      });

      toast.success(`Submission successfully ${status}!`);
      setSelectedSub(null);
      // Reload queue
      await loadSubmissions();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  function getInitials(name: string | null | undefined): string {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto relative">
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-2">
          <ClipboardList className="size-8 text-primary" />
          PR Solution Review Queue
        </h1>
        <p className="text-on-surface-variant max-w-xl">
          Inspect and review submissions from developers. Evaluate criteria, grade AI outputs, and approve/reject contributions to reward XP.
        </p>
      </div>

      {/* Queue Listing */}
      <div className="glass-panel rounded-3xl bg-surface-container-low border-outline-variant/40 overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <CheckCircle2 className="size-14 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface">Queue is clear!</h3>
              <p className="text-on-surface-variant text-sm max-w-sm mx-auto">
                There are currently no solutions pending administrator review. All developer PRs have been graded.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase bg-surface-container-high/20">
                  <th className="py-4 px-6">Developer</th>
                  <th className="py-4 px-6">Challenge</th>
                  <th className="py-4 px-6 text-center">AI Grade</th>
                  <th className="py-4 px-6 text-center">PR Link</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm text-on-surface">
                {submissions.map((sub) => {
                  const devName = sub.profiles?.display_name || "Developer";
                  const chTitle = sub.challenge?.title || "Challenge Objective";
                  const rewardPoints = sub.challenge?.points || 0;

                  return (
                    <tr key={sub.id} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={sub.profiles?.avatar_url ?? undefined} />
                            <AvatarFallback className="bg-surface-container-highest text-primary">
                              {getInitials(devName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold">{devName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <div className="font-bold text-on-surface">{chTitle}</div>
                          <div className="text-[10px] text-primary font-bold uppercase">+{rewardPoints} XP</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-black text-primary text-glow-cyan text-base">
                        {sub.ai_score !== null ? `${sub.ai_score}/100` : "N/A"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <a
                          href={sub.github_pr_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          PR Link
                          <GitPullRequest className="size-3" />
                        </a>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openReviewModal(sub)}
                          className="px-4 py-2 bg-primary text-on-primary-container font-bold text-xs rounded-xl active-glow transition-all hover:scale-[1.02]"
                        >
                          REVIEW NOW
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Inspector Dialog Backdrop */}
      {selectedSub && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl bg-surface-container-low border border-outline-variant p-8 rounded-3xl space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-start pb-4 border-b border-outline-variant/30">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest text-glow-cyan">submission review panel</span>
                <h2 className="text-xl font-bold text-on-surface mt-1">{selectedSub.challenge?.title}</h2>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-on-surface-variant hover:text-on-surface font-semibold text-sm"
              >
                Close
              </button>
            </div>

            {/* Inspect details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-high/40 p-4 rounded-xl border border-outline-variant/20">
                  <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Submitted By</div>
                  <div className="text-sm font-bold text-on-surface mt-1">
                    {selectedSub.profiles?.display_name || "Developer"}
                  </div>
                </div>
                <div className="bg-surface-container-high/40 p-4 rounded-xl border border-outline-variant/20">
                  <div className="text-[10px] text-on-surface-variant uppercase font-semibold">GitHub PR Link</div>
                  <div className="mt-1">
                    <a
                      href={selectedSub.github_pr_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      Inspect Code Changes
                      <GitPullRequest className="size-3" />
                    </a>
                  </div>
                </div>
              </div>

              {selectedSub.notes && (
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-semibold">Developer Notes</label>
                  <p className="text-xs text-on-surface bg-surface-container-high/30 p-3 rounded-xl border border-outline-variant/10 italic">
                    "{selectedSub.notes}"
                  </p>
                </div>
              )}

              {/* Editing Grade & Review Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1 space-y-1">
                  <label htmlFor="aiScoreInput" className="text-[10px] text-on-surface-variant uppercase font-bold">Grade (AI Score)</label>
                  <input
                    id="aiScoreInput"
                    type="number"
                    min="0"
                    max="100"
                    value={aiScore}
                    onChange={(e) => setAiScore(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant focus:border-primary text-sm font-mono text-on-surface outline-none"
                  />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <label htmlFor="aiFeedbackInput" className="text-[10px] text-on-surface-variant uppercase font-bold">AI Review / Feedback Notes</label>
                  <input
                    id="aiFeedbackInput"
                    type="text"
                    value={aiFeedback}
                    onChange={(e) => setAiFeedback(e.target.value)}
                    placeholder="Enter manual override comments or automated review feedback..."
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant focus:border-primary text-sm text-on-surface outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submitting Actions */}
            <div className="flex gap-4 pt-4 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => handleReviewSubmit("rejected")}
                disabled={submittingReview}
                className="flex-1 py-3 bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 disabled:opacity-50 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <XCircle className="size-4" />
                REJECT SOLUTION
              </button>
              <button
                type="button"
                onClick={() => handleReviewSubmit("approved")}
                disabled={submittingReview}
                className="flex-1 py-3 bg-emerald-500 text-on-primary-container disabled:opacity-50 hover:scale-[1.01] text-sm font-bold rounded-xl transition-all active-glow flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="size-4" />
                APPROVE SOLUTION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
