"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { usersApi } from "@/lib/api-client";
import type { UserProgress } from "@/types";
import { Compass, Flame, Milestone, Lock, CheckCircle2, Play, Sparkles, Loader2 } from "lucide-react";

interface JourneyNode {
  id: number;
  title: string;
  description: string;
  xpRequired: number;
  status: "completed" | "active" | "locked";
  iconName: string;
}

export default function MyJourneyPage() {
  const { profile } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    const loadProgress = async () => {
      try {
        setLoading(false);
        const data = await usersApi.profile(profile.id);
        setProgress(data.progress);
      } catch (e) {
        console.error("Error loading progress:", e);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const currentXp = progress?.points || 0;

  // Configure roadmap nodes based on user XP
  const nodes: JourneyNode[] = [
    {
      id: 1,
      title: "Constellation Setup",
      description: "Initialize developer profile & establish GitHub link connection.",
      xpRequired: 0,
      status: currentXp >= 0 ? "completed" : "locked",
      iconName: "setup",
    },
    {
      id: 2,
      title: "First Light Claim",
      description: "Claim your first development challenge successfully.",
      xpRequired: 100,
      status: currentXp >= 100 ? "completed" : currentXp >= 0 ? "active" : "locked",
      iconName: "claim",
    },
    {
      id: 3,
      title: "Milestone Facet",
      description: "Complete 3 challenges & earn 500 XP to forge a crystal facet.",
      xpRequired: 500,
      status: currentXp >= 500 ? "completed" : currentXp >= 100 ? "active" : "locked",
      iconName: "facet",
    },
    {
      id: 4,
      title: "Core Core Contributor",
      description: "Build 1000 XP reward score to earn Core credentials.",
      xpRequired: 1000,
      status: currentXp >= 1000 ? "completed" : currentXp >= 500 ? "active" : "locked",
      iconName: "credentials",
    },
    {
      id: 5,
      title: "Galaxy Master Architect",
      description: "Achieve 2500 XP to unlock custom advanced dashboard themes.",
      xpRequired: 2500,
      status: currentXp >= 2500 ? "completed" : currentXp >= 1000 ? "active" : "locked",
      iconName: "master",
    },
  ];

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-2">
          <Compass className="size-8 text-primary" />
          My Contribution Journey
        </h1>
        <p className="text-on-surface-variant max-w-xl">
          Track your progress through developer tiers, forge constellation fragments, and keep consistency streaks alive.
        </p>
      </div>

      {/* Stats Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Streak Details */}
        <div className="glass-panel p-6 rounded-3xl bg-surface-container-low border-outline-variant/40 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">active streak</span>
            <h2 className="text-3xl font-black text-on-surface flex items-center gap-2">
              <Flame className="size-7 text-[#ffb95f]" fill="#ffb95f" />
              26 Days Row
            </h2>
            <p className="text-xs text-on-surface-variant">Next reward milestone unlocks in 4 days!</p>
          </div>
          <div className="size-16 rounded-full bg-[#ffb95f]/10 border border-[#ffb95f]/20 flex items-center justify-center font-bold text-2xl text-[#ffb95f]">
            26
          </div>
        </div>

        {/* XP Progress Slider */}
        <div className="glass-panel p-6 rounded-3xl bg-surface-container-low border-outline-variant/40 space-y-4 flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            <span>Constellation XP Score</span>
            <span className="text-primary text-glow-cyan">{currentXp} XP total</span>
          </div>

          <div className="w-full bg-surface-container-high h-3.5 rounded-full overflow-hidden border border-outline-variant/20 relative">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full active-glow transition-all duration-500"
              style={{ width: `${Math.min((currentXp / 2500) * 100, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
            <span>0 XP (V1 Setup)</span>
            <span>2,500 XP (Galaxy Master)</span>
          </div>
        </div>
      </div>

      {/* Roadmap Nodes Timeline */}
      <div className="glass-panel p-8 rounded-3xl bg-surface-container-low border-outline-variant/40 space-y-8">
        <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 pb-4 border-b border-outline-variant/20">
          <Milestone className="size-5 text-primary" />
          Constellation Milestones Roadmap
        </h2>

        <div className="relative pl-8 border-l border-outline-variant/30 space-y-12">
          {nodes.map((node) => {
            const isCompleted = node.status === "completed";
            const isActive = node.status === "active";
            const isLocked = node.status === "locked";

            return (
              <div key={node.id} className="relative group">
                {/* Node Ring Badge on Left Line */}
                <div
                  className={`absolute -left-[49px] top-1 size-9 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                    isCompleted
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : isActive
                      ? "bg-primary-container border-primary text-primary active-glow"
                      : "bg-surface-container-highest border-outline-variant text-on-surface-variant/40"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-5" />
                  ) : isActive ? (
                    <Play className="size-4" fill="currentColor" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                </div>

                {/* Node Contents card */}
                <div
                  className={`glass-panel p-5 rounded-2xl bg-surface-container-high/40 border transition-all ${
                    isActive ? "border-primary/50 shadow-md active-glow bg-surface-container-high/60" : "border-outline-variant/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="space-y-1">
                      <h3
                        className={`font-bold ${
                          isCompleted
                            ? "text-emerald-400"
                            : isActive
                            ? "text-primary text-glow-cyan"
                            : "text-on-surface-variant/70"
                        }`}
                      >
                        {node.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {node.description}
                      </p>
                    </div>
                    
                    <span className="text-[10px] font-bold px-3 py-1 rounded-xl bg-surface-container-highest border border-outline-variant/30 self-start sm:self-center">
                      {node.xpRequired} XP Required
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
