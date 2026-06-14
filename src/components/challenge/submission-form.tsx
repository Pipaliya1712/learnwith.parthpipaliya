"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submissionsApi } from "@/lib/api-client";
import { toast } from "sonner";
import { Link as LinkIcon, FileText, CheckCircle2, Hourglass, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SubmissionFormProps {
  challengeId: string;
  challengeSlug: string;
  challengeTitle: string;
}

export function SubmissionForm({
  challengeId,
  challengeSlug,
  challengeTitle,
}: SubmissionFormProps) {
  const router = useRouter();
  const [prUrl, setPrUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prUrl) {
      toast.error("Please provide your GitHub Pull Request URL.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      await submissionsApi.submit({
        challenge_id: challengeId,
        github_pr_url: prUrl,
        github_repo_url: repoUrl || undefined,
        notes: notes || undefined,
      });

      toast.success("Solution submitted successfully! Running test validations...");
      
      // Delay redirect to let user read success message
      setTimeout(() => {
        router.push(`/challenges/${challengeSlug}`);
        router.refresh();
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || "Failed to submit solution. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Left: Submission Form */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 mb-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Submit Challenge Solution
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Provide your GitHub Pull Request link and architectural notes for peer and mentor review.
          </p>
        </div>

        {/* Input Card */}
        <form onSubmit={handleSubmit} className="bg-[#1b1b23] border border-outline-variant rounded-xl p-6 space-y-6">
          {/* GitHub PR URL */}
          <div className="space-y-2">
            <Label htmlFor="pr-url" className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="size-3.5" />
              GitHub Pull Request URL
            </Label>
            <Input
              id="pr-url"
              placeholder="https://github.com/username/repo/pull/1"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              className="bg-[#0d0d15] border-outline-variant text-primary font-mono text-sm placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* GitHub Repo URL */}
          <div className="space-y-2">
            <Label htmlFor="repo-url" className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="size-3.5" />
              GitHub Repository URL (Optional)
            </Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/username/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="bg-[#0d0d15] border-outline-variant text-primary font-mono text-sm placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Technical Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Technical Notes & Architecture
            </Label>
            <Textarea
              id="notes"
              rows={8}
              placeholder={`## Architecture Overview
Briefly describe how you approached the problem...

### Tech Stack
- React / Tailwind
- Node.js / Express`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#0d0d15] border-outline-variant text-foreground font-mono text-sm placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Submission Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <InfoIcon />
              This submission will be visible to mentors and reviewers.
            </p>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <Link href={`/challenges/${challengeSlug}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="gradient"
                className="px-6 font-bold shadow-lg"
              >
                {isSubmitting ? "Uploading..." : "Submit Solution"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Right: Status and Instructions */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Review Lifecycle Card */}
        <div className="bg-[#1b1b23] border border-outline-variant rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-foreground">
            Review Lifecycle
          </h3>
          <div className="relative mt-4">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-outline-variant" />
            <div className="space-y-6 relative">
              {/* Step 1 */}
              <div className="flex items-start gap-3 relative z-10 transition-transform hover:translate-x-1 duration-200">
                <div className="size-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold font-mono">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider">
                    Submission Draft
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Preparing details and checking branch tests.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 relative z-10 transition-transform hover:translate-x-1 duration-200">
                <div className="size-6 rounded-full bg-muted border border-outline-variant flex items-center justify-center text-muted-foreground text-xs font-bold font-mono">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                    Technical Review
                  </h4>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    AI verification + mentor review and check.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 relative z-10 transition-transform hover:translate-x-1 duration-200">
                <div className="size-6 rounded-full bg-muted border border-outline-variant flex items-center justify-center text-muted-foreground text-xs font-bold font-mono">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                    Approval & XP
                  </h4>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    Points awarded. Constellation node unlocked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Checklist */}
        <div className="bg-[#1b1b23] border border-outline-variant rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-tertiary" />
            Review Checklist
          </h3>
          <ul className="space-y-3 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
              <span>Public repository access or team-invite granted.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
              <span>Comprehensive README with setup instructions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
              <span>Clean code with descriptive variable naming.</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-4 text-primary shrink-0"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 111.083.985l-.04.02a.75.75 0 01-1.083-.985zM12 18.75a.75.75 0 00.75-.75v-4.5a.75.75 0 00-1.5 0v4.5a.75.75 0 00.75.75zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z"
      />
    </svg>
  );
}
