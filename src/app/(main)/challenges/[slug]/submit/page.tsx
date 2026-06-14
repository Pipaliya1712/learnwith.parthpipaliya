"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { challengesApi, submissionsApi } from "@/lib/api-client";
import type { Challenge, Submission } from "@/types";
import { Trophy, Clock, Sparkles, ChevronLeft, Loader2, GitPullRequest, Code, AlertCircle, FileText, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function SolutionSubmissionPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [prUrl, setPrUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const ch = await challengesApi.getBySlug(slug);
      setChallenge(ch);

      // Check if user already submitted for this challenge
      try {
        const mySubs = await submissionsApi.mySubmissions();
        const existing = (mySubs.items || []).find((s: any) => s.challenge_id === ch.id);
        if (existing) {
          setSubmission(existing);
          setPrUrl(existing.github_pr_url || "");
          setRepoUrl(existing.github_repo_url || "");
          setNotes(existing.notes || "");
        }
      } catch (e) {
        console.error("Error loading submissions:", e);
      }
    } catch (err) {
      console.error("Error loading solution page:", err);
      toast.error("Failed to load submission page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    if (!prUrl) {
      toast.error("Please enter your GitHub Pull Request URL.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submissionsApi.submit({
        challenge_id: challenge.id,
        github_pr_url: prUrl,
        github_repo_url: repoUrl || undefined,
        notes: notes || undefined,
      });

      toast.success(res.message || "Solution submitted successfully!");
      // Reload submission status
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit solution.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="glass-panel p-10 rounded-3xl text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="size-12 text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-on-surface">Challenge Not Found</h3>
        <p className="text-on-surface-variant text-sm">
          The challenge you are submitting a solution for could not be found.
        </p>
        <Link href="/challenges">
          <button className="px-6 py-2 bg-primary text-on-primary-container font-semibold rounded-xl">
            Back to Challenges
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      {/* Back Button */}
      <Link
        href={`/challenges/${challenge.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors group"
      >
        <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to challenge details
      </Link>

      {/* Main Container */}
      <div className="glass-panel p-8 rounded-3xl bg-surface-container-low border-outline-variant/55 space-y-6">
        <div className="space-y-2 pb-6 border-b border-outline-variant/30">
          <span className="text-xs font-bold text-primary uppercase tracking-widest text-glow-cyan">submit solution</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">{challenge.title}</h1>
          <p className="text-sm text-on-surface-variant">
            Enter the details of your contribution. Solutions undergo automatic AI reviews and admin grading.
          </p>
        </div>

        {/* Existing Submission Status Display */}
        {submission && (
          <div className="p-6 rounded-2xl border bg-surface-container-high/30 border-outline-variant/30 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <GitPullRequest className="size-5 text-primary" />
                Latest Submission Status
              </h2>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full border ${
                  submission.status === "approved"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : submission.status === "rejected"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {submission.status.toUpperCase()}
              </span>
            </div>

            {submission.ai_score !== null && submission.ai_score !== undefined && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                <div className="col-span-1 border-r border-outline-variant/20 pr-4 flex flex-col justify-center">
                  <span className="text-xs text-on-surface-variant uppercase font-semibold">ai rating</span>
                  <span className="text-3xl font-black text-primary mt-1 text-glow-cyan">{submission.ai_score}/100</span>
                </div>
                <div className="col-span-3 text-sm text-on-surface-variant flex flex-col justify-center">
                  <span className="text-xs text-on-surface-variant uppercase font-semibold">automated feedback</span>
                  <p className="mt-1 leading-relaxed italic">{submission.ai_feedback || "No feedback available."}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submission Form */}
        {(!submission || submission.status === "in_progress" || submission.status === "rejected") ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="prUrl" className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                <GitPullRequest className="size-4 text-primary" />
                GitHub Pull Request URL
              </label>
              <input
                id="prUrl"
                type="url"
                required
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                placeholder="https://github.com/username/repo/pull/1"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all"
              />
              <p className="text-[11px] text-on-surface-variant">
                The open-source Pull Request in the target repository containing your solution.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="repoUrl" className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                <Code className="size-4 text-primary" />
                GitHub Fork Repository URL (Optional)
              </label>
              <input
                id="repoUrl"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                <FileText className="size-4 text-primary" />
                Implementation & Technical Notes
              </label>
              <textarea
                id="notes"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your implementation details, files changed, or tests run..."
                className="w-full px-4 py-3 rounded-xl bg-surface-container-high border border-outline-variant focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-on-primary-container disabled:opacity-50 hover:scale-[1.01] font-bold rounded-xl active-glow transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="size-5" />
                  SUBMIT FOR GRADING
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-outline-variant bg-surface-container-high/20 text-center space-y-4">
            <CheckCircle2 className="size-12 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface">Solution Submitted</h3>
              <p className="text-on-surface-variant text-sm max-w-sm mx-auto">
                You have already submitted a solution that is currently under review or has been approved. Double submissions are locked.
              </p>
            </div>
            <div className="pt-2">
              <a
                href={submission.github_pr_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                View pull request on GitHub
                <GitPullRequest className="size-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
