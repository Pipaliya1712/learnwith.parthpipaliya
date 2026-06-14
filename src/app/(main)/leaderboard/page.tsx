import { getLeaderboardServer, getCurrentUserServer, getUserProfileServer } from "@/lib/server-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Star, Target, Crown, Medal, Flame, ChevronLeft, ChevronRight, CheckCircle, Info } from "lucide-react";
import Link from "next/link";

function getMilestoneInfo(points: number) {
  let prevPoints = 0;
  let nextPoints = 100;
  
  if (points <= 100) {
    prevPoints = 0;
    nextPoints = 100;
  } else if (points <= 300) {
    prevPoints = 100;
    nextPoints = 300;
  } else if (points <= 700) {
    prevPoints = 300;
    nextPoints = 700;
  } else if (points <= 1500) {
    prevPoints = 700;
    nextPoints = 1500;
  } else {
    prevPoints = 1500;
    nextPoints = 5000;
  }

  const range = nextPoints - prevPoints;
  const earned = points - prevPoints;
  const percent = Math.min(100, Math.max(0, Math.round((earned / range) * 100)));

  return { prevPoints, nextPoints, percent };
}

export default async function LeaderboardPage() {
  const leaderboardData = await getLeaderboardServer(50);
  const items = leaderboardData.items || [];

  const currentUser = await getCurrentUserServer();
  let myStats = {
    rank: 0,
    points: 0,
    level: "V1",
    solved_challenges: 0,
  };

  if (currentUser) {
    const profileData = await getUserProfileServer(currentUser.id);
    if (profileData && profileData.progress) {
      myStats = {
        rank: profileData.progress.rank || 0,
        points: profileData.progress.points || 0,
        level: profileData.progress.level || "V1",
        solved_challenges: profileData.progress.solved_challenges || 0,
      };
    }
  }

  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  // Helper for mock streak and status matching solved challenges
  const getStreak = (solved: number) => {
    return solved > 0 ? `${Math.min(30, solved * 2)}d` : "0d";
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-10 min-h-screen pb-16">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-glow-cyan text-primary">
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Recognizing technical excellence and mastery across the platform. Rise through the ranks by completing projects and challenges.
          </p>
        </div>
        
        {/* Toggle weekly vs all time (Visual only) */}
        <div className="flex gap-1 bg-[#1b1b23] p-1 rounded-xl border border-outline-variant">
          <Button size="sm" className="px-4 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider">
            All Time
          </Button>
          <Button size="sm" variant="ghost" className="px-4 text-muted-foreground text-xs uppercase tracking-wider">
            Weekly
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl bg-[#1b1b23]/50">
          <Trophy className="size-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold">No leaders yet</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Complete a challenge to be the first on the board!
          </p>
        </div>
      ) : (
        <>
          {/* Bento Grid: Top 3 & My Standing */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Podium (Top 3) */}
            <div className="lg:col-span-8 grid grid-cols-3 gap-4 h-80 items-end">
              
              {/* Rank 2 */}
              {top3[1] && (
                <Link
                  href={`/profile/${top3[1].user_id}`}
                  className="bg-[#1b1b23] border border-outline-variant rounded-xl flex flex-col items-center justify-center p-4 text-center group hover:border-primary/45 transition-all h-[90%]"
                >
                  <div className="relative mb-3">
                    <Avatar className="w-16 h-16 border-4 border-outline-variant">
                      <AvatarImage src={top3[1].avatar_url || ""} />
                      <AvatarFallback className="text-lg font-bold">
                        {getInitials(top3[1].display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-muted-foreground w-6 h-6 rounded-full flex items-center justify-center border-2 border-background text-[10px] font-bold text-foreground">
                      2
                    </div>
                  </div>
                  <span className="font-bold text-sm truncate w-full px-2 text-foreground group-hover:text-primary transition-colors">
                    {top3[1].display_name}
                  </span>
                  <span className="font-mono text-xs text-tertiary mt-0.5">
                    {top3[1].points} XP
                  </span>
                </Link>
              )}

              {/* Rank 1 (Elevated) */}
              {top3[0] && (
                <Link
                  href={`/profile/${top3[0].user_id}`}
                  className="bg-[#24242e] border-2 border-primary/30 rounded-xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group hover:border-primary/60 transition-all h-full"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                  <div className="relative mb-4">
                    <Avatar className="w-20 h-20 border-4 border-primary">
                      <AvatarImage src={top3[0].avatar_url || ""} />
                      <AvatarFallback className="text-xl font-bold">
                        {getInitials(top3[0].display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-primary w-8 h-8 rounded-full flex items-center justify-center border-2 border-background text-primary-foreground">
                      <Crown className="size-4 fill-current" />
                    </div>
                  </div>
                  <span className="font-extrabold text-base truncate w-full px-2 text-foreground group-hover:text-primary transition-colors">
                    {top3[0].display_name}
                  </span>
                  <span className="font-mono text-sm font-extrabold text-tertiary mt-0.5">
                    {top3[0].points} XP
                  </span>
                </Link>
              )}

              {/* Rank 3 */}
              {top3[2] && (
                <Link
                  href={`/profile/${top3[2].user_id}`}
                  className="bg-[#1b1b23] border border-outline-variant rounded-xl flex flex-col items-center justify-center p-4 text-center group hover:border-primary/45 transition-all h-[80%]"
                >
                  <div className="relative mb-3">
                    <Avatar className="w-16 h-16 border-4 border-outline-variant">
                      <AvatarImage src={top3[2].avatar_url || ""} />
                      <AvatarFallback className="text-lg font-bold">
                        {getInitials(top3[2].display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-amber-700 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background text-[10px] font-bold text-white">
                      3
                    </div>
                  </div>
                  <span className="font-bold text-sm truncate w-full px-2 text-foreground group-hover:text-primary transition-colors">
                    {top3[2].display_name}
                  </span>
                  <span className="font-mono text-xs text-tertiary mt-0.5">
                    {top3[2].points} XP
                  </span>
                </Link>
              )}

            </div>

            {/* My Stats Card */}
            <div className="lg:col-span-4 bg-[#0d0d15] border border-outline-variant rounded-xl p-6 flex flex-col justify-between min-h-[260px]">
              <div>
                <h3 className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest mb-4">
                  Your Standing
                </h3>
                
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-primary">
                    <AvatarImage src={currentUser?.avatar_url || ""} />
                    <AvatarFallback className="text-sm font-bold">
                      {getInitials(currentUser?.display_name || currentUser?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-base font-extrabold text-foreground">
                      {currentUser?.display_name || "You"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Level {myStats.level} Developer
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-outline-variant/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Global Standing</span>
                  <span className="font-bold text-foreground font-mono text-sm">
                    {myStats.rank > 0 ? `#${myStats.rank}` : "Unranked"}
                  </span>
                </div>
                
                {(() => {
                  const ms = getMilestoneInfo(myStats.points);
                  return (
                    <div className="space-y-1.5">
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${ms.percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                        <span>Milestone Progress</span>
                        <span>{ms.percent}%</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>

          {/* Rankings Table */}
          <div className="bg-[#1b1b23] border border-outline-variant rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Global Rankings</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="font-mono text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b border-outline-variant/40 bg-muted/10">
                    <th className="px-6 py-3">Rank</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Streak</th>
                    <th className="px-6 py-3 text-right">Mastery XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {items.map((user: any) => {
                    const isSelf = currentUser && user.user_id === currentUser.id;
                    const streakVal = getStreak(user.solved_challenges);
                    return (
                      <tr
                        key={user.user_id}
                        className={`transition-colors hover:bg-muted/10 ${
                          isSelf ? "bg-primary-container/10 font-bold" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className={`font-mono text-sm font-bold ${isSelf ? "text-primary" : "text-muted-foreground"}`}>
                            {user.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/profile/${user.user_id}`} className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border">
                              <AvatarImage src={user.avatar_url || ""} />
                              <AvatarFallback className="text-xs font-bold">
                                {getInitials(user.display_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                                {user.display_name}
                                {isSelf && (
                                  <Badge className="bg-primary/25 text-primary text-[9px] hover:bg-primary/30 border-none font-bold uppercase py-0 px-1">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                Level {user.level}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <CheckCircle className="size-4 text-primary mx-auto opacity-75" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          {streakVal !== "0d" ? (
                            <div className="flex items-center justify-center gap-1 text-orange-500 font-mono text-xs font-bold">
                              <Flame className="size-3.5 fill-current" />
                              <span>{streakVal}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/45 text-xs font-mono">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono text-sm font-bold text-tertiary">
                            {user.points.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer (Visual placeholder matching style) */}
            <div className="p-4 border-t border-outline-variant/40 flex items-center justify-between text-xs">
              <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="size-4" /> PREVIOUS
              </Button>
              <div className="flex gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded bg-primary text-primary-foreground font-bold font-mono">
                  1
                </span>
              </div>
              <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-foreground">
                NEXT <ChevronRight className="size-4" />
              </Button>
            </div>

          </div>

          {/* Footer Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground border-t border-outline-variant/40 pt-6 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Info className="size-3.5" />
                Updated every 5 minutes
              </span>
            </div>
            <span>© 2026 Learn With Technical Board</span>
          </div>

        </>
      )}

    </div>
  );
}
