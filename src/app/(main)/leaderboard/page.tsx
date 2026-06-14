"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { usersApi } from "@/lib/api-client";
import type { LeaderboardEntry, UserProgress } from "@/types";
import { Crown, Trophy, Award, Code, Loader2, Sparkles, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<LeaderboardEntry[]>([]);
  const [currentUserProgress, setCurrentUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load leaderboard items
        const leaderboardData = await usersApi.leaderboard();
        setItems(leaderboardData.items || []);

        // Load current user rank details
        if (profile?.id) {
          const profileData = await usersApi.profile(profile.id);
          setCurrentUserProgress(profileData.progress);
        }
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Find top 3 ranks
  const top1 = items.find((item) => item.rank === 1);
  const top2 = items.find((item) => item.rank === 2);
  const top3 = items.find((item) => item.rank === 3);

  const listItems = items.filter((item) => item.rank > 3);

  function getInitials(name: string | null | undefined): string {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-2">
          <Crown className="size-8 text-primary" />
          Global Leaderboard
        </h1>
        <p className="text-on-surface-variant max-w-xl">
          See where you stand in the constellation of open-source developers. Solve challenges and earn reward score XP to climb ranks.
        </p>
      </div>

      {/* Top 3 Podiums */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-6">
        {/* 2nd Place */}
        {top2 && (
          <div className="glass-panel p-6 rounded-3xl bg-surface-container-low border-outline-variant/35 text-center flex flex-col items-center gap-3 order-2 md:order-1 md:h-[280px] justify-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-400" />
            <div className="size-16 rounded-full border-2 border-blue-400 p-0.5 relative">
              <Avatar className="size-full">
                <AvatarImage src={top2.avatar_url ?? undefined} />
                <AvatarFallback className="bg-surface-container-high text-on-surface">{getInitials(top2.display_name)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-blue-400 text-on-primary-container size-6 rounded-full flex items-center justify-center text-xs font-black">2</div>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-on-surface truncate max-w-[150px]">{top2.display_name}</h3>
              <p className="text-xs text-primary font-bold tracking-wider">LEVEL {top2.level}</p>
            </div>
            <div className="bg-surface-container-high/40 px-4 py-2 rounded-xl border border-outline-variant/20 space-y-0.5">
              <div className="text-base font-black text-on-surface">{top2.points.toLocaleString()} XP</div>
              <div className="text-[10px] text-on-surface-variant font-medium">{top2.solved_challenges} Challenges Solved</div>
            </div>
          </div>
        )}

        {/* 1st Place Crown */}
        {top1 && (
          <div className="glass-panel p-8 rounded-3xl bg-surface-container-low border-outline-variant/50 text-center flex flex-col items-center gap-4 order-1 md:order-2 md:h-[320px] justify-center relative overflow-hidden shadow-xl active-glow">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#ffb95f]" />
            <div className="relative">
              <Crown className="size-8 text-[#ffb95f] absolute -top-7 left-1/2 -translate-x-1/2 rotate-12 drop-shadow-md" fill="#ffb95f" />
              <div className="size-20 rounded-full border-2 border-[#ffb95f] p-0.5 relative">
                <Avatar className="size-full">
                  <AvatarImage src={top1.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-surface-container-high text-on-surface">{getInitials(top1.display_name)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-[#ffb95f] text-on-tertiary-container size-6 rounded-full flex items-center justify-center text-xs font-black">1</div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-on-surface text-lg truncate max-w-[180px]">{top1.display_name}</h3>
              <p className="text-xs text-[#ffb95f] font-bold tracking-wider text-glow-amber">LEVEL {top1.level} CORE</p>
            </div>
            <div className="bg-surface-container-highest/60 px-5 py-2.5 rounded-xl border border-outline-variant/30 space-y-0.5 shadow-md">
              <div className="text-lg font-black text-on-surface">{top1.points.toLocaleString()} XP</div>
              <div className="text-[10px] text-on-surface-variant font-medium">{top1.solved_challenges} Challenges Solved</div>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3 && (
          <div className="glass-panel p-6 rounded-3xl bg-surface-container-low border-outline-variant/35 text-center flex flex-col items-center gap-3 order-3 md:h-[280px] justify-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-600" />
            <div className="size-16 rounded-full border-2 border-amber-600 p-0.5 relative">
              <Avatar className="size-full">
                <AvatarImage src={top3.avatar_url ?? undefined} />
                <AvatarFallback className="bg-surface-container-high text-on-surface">{getInitials(top3.display_name)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white size-6 rounded-full flex items-center justify-center text-xs font-black">3</div>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-on-surface truncate max-w-[150px]">{top3.display_name}</h3>
              <p className="text-xs text-primary font-bold tracking-wider">LEVEL {top3.level}</p>
            </div>
            <div className="bg-surface-container-high/40 px-4 py-2 rounded-xl border border-outline-variant/20 space-y-0.5">
              <div className="text-base font-black text-on-surface">{top3.points.toLocaleString()} XP</div>
              <div className="text-[10px] text-on-surface-variant font-medium">{top3.solved_challenges} Challenges Solved</div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table List */}
      <div className="glass-panel rounded-3xl bg-surface-container-low border-outline-variant/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase bg-surface-container-high/20">
                <th className="py-4 px-6 text-center w-20">Rank</th>
                <th className="py-4 px-6">Developer</th>
                <th className="py-4 px-6 text-center">Level</th>
                <th className="py-4 px-6 text-center">Solved</th>
                <th className="py-4 px-6 text-right">Points XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm text-on-surface">
              {listItems.map((item) => (
                <tr
                  key={item.user_id}
                  className={`hover:bg-surface-container-high/30 transition-colors ${
                    profile?.id === item.user_id ? "bg-primary-container/10 font-bold" : ""
                  }`}
                >
                  <td className="py-4 px-6 text-center font-bold text-on-surface-variant">
                    #{item.rank}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={item.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-surface-container-highest text-primary">
                          {getInitials(item.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[200px]">{item.display_name}</span>
                      {profile?.id === item.user_id && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container">
                          YOU
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-semibold text-primary">
                    {item.level}
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-on-surface-variant">
                    {item.solved_challenges}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-on-surface tracking-tight">
                    {item.points.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current User Standing Card */}
      {profile && currentUserProgress && (
        <div className="glass-panel p-6 rounded-3xl bg-surface-container-high/30 border border-primary/30 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md active-glow">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-black text-2xl active-glow">
              #{currentUserProgress.rank && currentUserProgress.rank > 0 ? currentUserProgress.rank : "N/A"}
            </div>
            <div>
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">your global standing</div>
              <h3 className="text-xl font-black text-on-surface flex items-center gap-2 mt-0.5">
                <Sparkles className="size-5 text-[#ffb95f]" />
                {profile.display_name || profile.email || "Anonymous Learner"}
              </h3>
              <p className="text-xs text-on-surface-variant">
                Level {currentUserProgress.level} Core Contributor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 text-right self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 border-outline-variant/30 pt-4 md:pt-0">
            <div className="space-y-0.5">
              <span className="text-[10px] text-on-surface-variant font-semibold uppercase">completed</span>
              <div className="text-lg font-bold text-on-surface flex items-center gap-1.5 justify-end">
                <Code className="size-4 text-primary" />
                {currentUserProgress.solved_challenges} solved
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-on-surface-variant font-semibold uppercase">total score</span>
              <div className="text-xl font-black text-primary text-glow-cyan">
                {currentUserProgress.points.toLocaleString()} XP
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
