"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { challengesApi, projectsApi } from "@/lib/api-client";
import type { Challenge } from "@/types";
import { Trophy, Clock, ArrowRight, Loader2, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [claimedSlugs, setClaimedSlugs] = useState<string[]>([]);
  
  // Filters
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load projects for filter dropdown
        const projectsData = await projectsApi.dashboard({ limit: 100 });
        setProjects(projectsData.projects || []);

        // Load claimed challenges to see what user has claimed
        try {
          const claimedData = await challengesApi.myClaimed();
          const slugs = (claimedData.items || []).map((c: any) => c.challenge?.slug).filter(Boolean);
          setClaimedSlugs(slugs);
        } catch (e) {
          console.error("Error loading claimed:", e);
        }

        // Fetch challenges
        const challengesData = await challengesApi.list({ limit: 100, status: "published" });
        setChallenges(challengesData.items || []);
      } catch (err) {
        console.error("Error loading challenges explorer:", err);
        toast.error("Failed to load challenges.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleClaim = async (id: string, slug: string) => {
    try {
      setClaimingId(id);
      await challengesApi.claim(id);
      toast.success("Challenge claimed successfully!");
      setClaimedSlugs((prev) => [...prev, slug]);
    } catch (err: any) {
      toast.error(err.message || "Failed to claim challenge.");
    } finally {
      setClaimingId(null);
    }
  };

  const filteredChallenges = challenges.filter((ch) => {
    const matchesDifficulty = selectedDifficulty === "all" || ch.difficulty === selectedDifficulty;
    const matchesProject = selectedProject === "all" || ch.project_id === selectedProject;
    return matchesDifficulty && matchesProject;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
    <div className="space-y-8 pb-10">
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-2">
          <Trophy className="size-8 text-primary" />
          Challenges Explorer
        </h1>
        <p className="text-on-surface-variant max-w-xl">
          Level up your credentials by contributing to live repositories. Earn XP points and populate your developer journey milestone timeline.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between glass-panel p-4 rounded-2xl bg-surface-container-low border-outline-variant/30">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-semibold">
            <Filter className="size-4" />
            Filters:
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant text-sm text-on-surface outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant text-sm text-on-surface outline-none focus:border-primary transition-colors cursor-pointer max-w-xs"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-on-surface-variant font-medium text-right self-end sm:self-center">
          Showing {filteredChallenges.length} challenges
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.length === 0 ? (
          <div className="col-span-full glass-panel p-16 rounded-3xl text-center border-dashed border-outline-variant bg-surface-container-low/50 space-y-4">
            <div className="mx-auto size-16 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant">
              <Trophy className="size-8 text-on-surface-variant" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface">No challenges found</h3>
              <p className="text-on-surface-variant max-w-sm mx-auto text-sm">
                Try loosening your filters or select a different difficulty category.
              </p>
            </div>
          </div>
        ) : (
          filteredChallenges.map((ch) => {
            const isClaimed = claimedSlugs.includes(ch.slug);
            return (
              <div
                key={ch.id}
                className="glass-panel p-6 rounded-2xl bg-surface-container-low border-outline-variant/50 hover:border-primary/30 transition-all flex flex-col justify-between gap-6 group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider text-glow-cyan">
                      {ch.project?.name || "Independent"}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${difficultyColors[ch.difficulty] || "bg-muted text-muted-foreground border-border"}`}>
                      {ch.difficulty?.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {ch.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2">
                      {ch.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                    <div className="flex items-center gap-1">
                      <Sparkles className="size-3.5 text-[#ffb95f]" />
                      <span>{ch.points} XP Reward</span>
                    </div>
                    {ch.estimated_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        <span>~{ch.estimated_hours}h est</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Link href={`/challenges/${ch.slug}`} className="flex-1">
                    <button className="w-full py-2.5 bg-surface-container-highest border border-outline-variant hover:bg-surface-container-high text-on-surface text-sm font-semibold rounded-xl transition-all">
                      VIEW DETAILS
                    </button>
                  </Link>

                  {isClaimed ? (
                    <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl">
                      <CheckCircle2 className="size-4" />
                      CLAIMED
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaim(ch.id, ch.slug)}
                      disabled={claimingId === ch.id}
                      className="flex-1 py-2.5 bg-primary text-on-primary-container disabled:opacity-50 hover:scale-[1.01] text-sm font-semibold rounded-xl transition-all active-glow flex items-center justify-center gap-1"
                    >
                      {claimingId === ch.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "CLAIM CHALLENGE"
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
