"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { WebGLShader } from "@/components/visuals/webgl-shader";
import { CrystalViewer } from "@/components/visuals/crystal-viewer";
import { usersApi, challengesApi } from "@/lib/api-client";
import type { UserProgress } from "@/types";
import { Trophy, Code, Award, Flame, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [claimed, setClaimed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    const loadData = async () => {
      try {
        const profileData = await usersApi.profile(profile.id);
        setProgress(profileData.progress);
        
        const claimedData = await challengesApi.myClaimed();
        setClaimed(claimedData.items || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile?.id]);

  if (loading || !profile) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback default progress details
  const displayProgress = progress || {
    points: 0,
    level: "V1",
    solved_challenges: 0,
    approved_submissions: 0,
    rejected_submissions: 0,
    rank: 0,
    user_id: profile.id,
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section with WebGL Galaxy & ThreeJS Crystal */}
      <section className="relative h-[480px] w-full rounded-3xl overflow-hidden glass-panel flex flex-col justify-between p-8 md:p-12">
        <WebGLShader type="galaxy" className="absolute inset-0 w-full h-full galaxy-mask opacity-55" />
        
        {/* Top Header Row of Hero Card */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-primary uppercase text-glow-cyan">constellation level {displayProgress.level}</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="size-8 text-primary" />
              Crystal Journey
            </h1>
            <p className="text-on-surface-variant max-w-md">
              Every day of progress shapes your code constellation. Keep contributions moving to forge new facets.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-surface-container-low/80 border border-outline-variant px-5 py-3 rounded-2xl backdrop-blur-md">
            <Flame className="size-8 text-glow-amber text-[#ffb95f]" fill="#ffb95f" />
            <div className="text-left">
              <div className="text-2xl font-black text-on-surface">26 Days</div>
              <div className="text-xs text-on-surface-variant font-medium">Consistency builds mastery</div>
            </div>
          </div>
        </div>

        {/* Center/Bottom Row of Hero Card */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mt-4">
          <div className="flex justify-center items-center h-48 lg:h-56 glass-panel rounded-2xl p-4 bg-surface-container-lowest/40 border-outline-variant/30">
            <WebGLShader type="streak" className="w-full h-full" />
          </div>

          {/* Interactive 3D Dodecahedron Crystal Container */}
          <div className="relative flex justify-center items-center h-48 lg:h-56 glass-panel rounded-2xl overflow-hidden bg-surface-container-lowest/40 border-outline-variant/30">
            <CrystalViewer className="absolute inset-0" />
            <div className="absolute bottom-4 left-4 z-20 flex flex-col text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">facets generator</span>
              <span className="text-sm font-bold text-on-surface">3D Crystal Core Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gamified Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 bg-surface-container-low border-outline-variant/50 hover:border-primary/40 transition-colors group">
          <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy className="size-7 text-primary" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">total reward score</div>
            <div className="text-3xl font-extrabold text-on-surface tracking-tight mt-1 text-glow-cyan">{displayProgress.points.toLocaleString()} XP</div>
            <div className="text-xs text-on-surface-variant mt-0.5">Ranked Level {displayProgress.level} Contributor</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 bg-surface-container-low border-outline-variant/50 hover:border-secondary/40 transition-colors group">
          <div className="size-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Code className="size-7 text-secondary" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">challenges completed</div>
            <div className="text-3xl font-extrabold text-on-surface tracking-tight mt-1">{displayProgress.solved_challenges} Solved</div>
            <div className="text-xs text-on-surface-variant mt-0.5">{displayProgress.approved_submissions} Approved PR Submissions</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 bg-surface-container-low border-outline-variant/50 hover:border-tertiary/40 transition-colors group">
          <div className="size-14 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award className="size-7 text-tertiary" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">leaderboard standing</div>
            <div className="text-3xl font-extrabold text-on-surface tracking-tight mt-1 text-glow-amber">
              #{displayProgress.rank && displayProgress.rank > 0 ? displayProgress.rank : "N/A"}
            </div>
            <div className="text-xs text-on-surface-variant mt-0.5">Global Developer Standing</div>
          </div>
        </div>
      </section>

      {/* Claimed/Active Challenges */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <Award className="size-6 text-primary" />
            Claimed Constellations
          </h2>
          <Link
            href="/challenges"
            className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group"
          >
            Explore challenges
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {claimed.length === 0 ? (
            <div className="col-span-2 glass-panel p-10 rounded-3xl text-center border-dashed border-outline-variant bg-surface-container-low/50 space-y-4">
              <div className="mx-auto size-16 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant">
                <Code className="size-8 text-on-surface-variant" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-on-surface">No active claimed challenges</h3>
                <p className="text-on-surface-variant max-w-sm mx-auto text-sm">
                  Claim developer challenges, write submissions, and earn crystal energy fragments.
                </p>
              </div>
              <Link href="/challenges">
                <button className="px-6 py-2.5 bg-primary text-on-primary-container font-semibold rounded-xl active-glow transition-all hover:scale-[1.02]">
                  Find Challenges
                </button>
              </Link>
            </div>
          ) : (
            claimed.map((claim) => {
              const ch = claim.challenge || {};
              const difficultyColors: Record<string, string> = {
                beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                intermediate: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                advanced: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                expert: "bg-rose-500/10 text-rose-400 border-rose-500/20",
              };

              const statusColors: Record<string, string> = {
                in_progress: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                submitted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
              };

              const displayStatus: Record<string, string> = {
                in_progress: "In Progress",
                submitted: "Review Pending",
                approved: "Approved",
                rejected: "Rejected",
              };

              return (
                <div
                  key={claim.id}
                  className="glass-panel p-6 rounded-2xl bg-surface-container-low border-outline-variant/50 hover:border-primary/30 transition-all flex flex-col justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-on-surface-variant truncate">
                        {ch.project?.name || "Independent"}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyColors[ch.difficulty] || "bg-muted text-muted-foreground border-border"}`}>
                        {ch.difficulty?.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-on-surface line-clamp-1">{ch.title}</h3>
                    
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[claim.status] || "bg-muted text-muted-foreground border-border"}`}>
                        {displayStatus[claim.status] || claim.status}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        +{ch.points} Reward XP
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <Link href={`/challenges/${ch.slug}`} className="flex-1">
                      <button className="w-full py-2 bg-surface-container-highest border border-outline-variant hover:bg-surface-container-high text-on-surface text-sm font-semibold rounded-xl transition-all">
                        VIEW DETAILS
                      </button>
                    </Link>
                    {claim.status === "in_progress" && (
                      <Link href={`/challenges/${ch.slug}/submit`} className="flex-1">
                        <button className="w-full py-2 bg-primary text-on-primary-container hover:scale-[1.01] text-sm font-semibold rounded-xl transition-all active-glow">
                          SUBMIT SOLUTION
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
