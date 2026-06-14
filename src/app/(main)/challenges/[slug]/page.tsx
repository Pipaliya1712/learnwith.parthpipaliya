"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { challengesApi } from "@/lib/api-client";
import type { Challenge } from "@/types";
import { Trophy, Clock, Sparkles, ChevronLeft, Loader2, Code, Tag, Award, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ChallengeDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load challenge
        const ch = await challengesApi.getBySlug(slug);
        setChallenge(ch);

        // Check claim status
        try {
          const claimedData = await challengesApi.myClaimed();
          const match = (claimedData.items || []).find((c: any) => c.challenge?.id === ch.id);
          if (match) {
            setClaimStatus(match.status); // in_progress, submitted, approved, rejected
          }
        } catch (e) {
          console.error("Error loading claims:", e);
        }
      } catch (err) {
        console.error("Error loading challenge details:", err);
        toast.error("Failed to load challenge details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const handleClaim = async () => {
    if (!challenge) return;
    try {
      setClaiming(true);
      await challengesApi.claim(challenge.id);
      toast.success("Challenge claimed successfully! Let's build!");
      setClaimStatus("in_progress");
    } catch (err: any) {
      toast.error(err.message || "Failed to claim challenge.");
    } finally {
      setClaiming(false);
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
          The challenge you are looking for does not exist or has been archived.
        </p>
        <Link href="/challenges">
          <button className="px-6 py-2 bg-primary text-on-primary-container font-semibold rounded-xl">
            Back to Challenges
          </button>
        </Link>
      </div>
    );
  }

  const difficultyColors: Record<string, string> = {
    beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    intermediate: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    advanced: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    expert: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/challenges"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors group"
      >
        <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to explorer
      </Link>

      {/* Main Details Panel */}
      <div className="glass-panel p-8 rounded-3xl bg-surface-container-low border-outline-variant/50 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-outline-variant/30">
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-widest text-glow-cyan">
              {challenge.project?.name || "Independent"} Project Challenge
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">{challenge.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${difficultyColors[challenge.difficulty] || "bg-muted text-muted-foreground border-border"}`}>
                {challenge.difficulty?.toUpperCase()}
              </span>
              <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                <Sparkles className="size-3.5 text-[#ffb95f]" />
                +{challenge.points} XP Reward
              </span>
              {challenge.estimated_hours && (
                <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                  <Clock className="size-3.5" />
                  ~{challenge.estimated_hours} Hours Estimated
                </span>
              )}
            </div>
          </div>

          {/* Action Button Section */}
          <div className="w-full md:w-auto self-stretch md:self-auto flex items-center">
            {!claimStatus ? (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full md:w-auto px-8 py-3 bg-primary text-on-primary-container font-bold rounded-xl active-glow transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {claiming ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Trophy className="size-5" />
                    CLAIM CHALLENGE
                  </>
                )}
              </button>
            ) : claimStatus === "in_progress" ? (
              <Link href={`/challenges/${challenge.slug}/submit`} className="w-full md:w-auto">
                <button className="w-full md:w-auto px-8 py-3 bg-primary text-on-primary-container font-bold rounded-xl active-glow transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                  <Award className="size-5" />
                  SUBMIT SOLUTION
                </button>
              </Link>
            ) : claimStatus === "submitted" ? (
              <div className="w-full md:w-auto px-6 py-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-amber-400" />
                REVIEW PENDING
              </div>
            ) : claimStatus === "approved" ? (
              <div className="w-full md:w-auto px-6 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-400" />
                CHALLENGE COMPLETED
              </div>
            ) : (
              // Rejected
              <Link href={`/challenges/${challenge.slug}/submit`} className="w-full md:w-auto">
                <button className="w-full md:w-auto px-8 py-3 bg-primary text-on-primary-container font-bold rounded-xl active-glow transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                  <Award className="size-5" />
                  SUBMIT NEW SOLUTION
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Challenge Description */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Code className="size-5 text-primary" />
            Challenge Objective
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
            {challenge.description}
          </p>
        </div>

        {/* Acceptance Criteria */}
        {challenge.acceptance_criteria && (
          <div className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              Acceptance Criteria
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap bg-surface-container-high/40 p-5 rounded-2xl border border-outline-variant/20">
              {challenge.acceptance_criteria}
            </div>
          </div>
        )}

        {/* Associated Tags */}
        {challenge.tags && challenge.tags.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Tag className="size-5 text-primary" />
              Required Skill Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {challenge.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3.5 py-1 text-xs font-semibold bg-surface-container-highest/80 text-on-surface border border-outline-variant/30 rounded-xl"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
