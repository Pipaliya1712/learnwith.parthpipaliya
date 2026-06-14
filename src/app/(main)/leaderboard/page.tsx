import { getLeaderboardServer } from "@/lib/server-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Crown, Medal } from "lucide-react";
import Link from "next/link";

export default async function LeaderboardPage() {
  const data = await getLeaderboardServer(50);
  const items = data.items || [];

  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  const getPodiumStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          card: "border-yellow-500/50 bg-gradient-to-t from-yellow-500/10 to-transparent scale-105 z-10",
          icon: <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />,
          rankColor: "bg-yellow-500 text-yellow-950",
          height: "h-[350px]"
        };
      case 2:
        return {
          card: "border-slate-400/50 bg-gradient-to-t from-slate-400/10 to-transparent",
          icon: <Medal className="w-7 h-7 text-slate-400 mx-auto mb-2" />,
          rankColor: "bg-slate-400 text-slate-950",
          height: "h-[320px]"
        };
      case 3:
        return {
          card: "border-amber-600/50 bg-gradient-to-t from-amber-600/10 to-transparent",
          icon: <Medal className="w-6 h-6 text-amber-600 mx-auto mb-2" />,
          rankColor: "bg-amber-600 text-amber-950",
          height: "h-[300px]"
        };
      default:
        return {
          card: "",
          icon: null,
          rankColor: "bg-muted text-muted-foreground",
          height: ""
        };
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Global Leaderboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          The top open-source contributors on Learn With. Solve challenges, earn points, and level up your developer version.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed bg-card/50">
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Trophy className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">No Leaders Yet</h2>
          <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
            Complete a challenge to be the first on the board!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 pt-10 pb-6">
              {[top3[1], top3[0], top3[2]].map((user) => {
                if (!user) return null;
                const style = getPodiumStyle(user.rank);
                
                return (
                  <Link href={`/profile/${user.user_id}`} key={user.user_id} className={`w-full md:w-[280px] relative transition-all hover:-translate-y-2 duration-300 ${style.card} ${style.height}`}>
                    <Card className="w-full h-full bg-transparent border-none shadow-none">
                      <CardContent className="pt-6 text-center flex flex-col h-full justify-between">
                      <div>
                        {style.icon}
                        <div className="relative inline-block mb-4">
                          <Avatar className="w-20 h-20 border-4 border-background mx-auto shadow-xl">
                            <AvatarImage src={user.avatar_url || ""} alt={user.display_name} />
                            <AvatarFallback className="text-2xl">{user.display_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full font-bold text-xs shadow-lg ${style.rankColor}`}>
                            #{user.rank}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold truncate px-2">{user.display_name}</h3>
                        <Badge variant="outline" className="mt-2 bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
                          {user.level}
                        </Badge>
                      </div>
                      
                      <div className="bg-background/40 backdrop-blur-md rounded-lg p-3 flex justify-around mt-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-yellow-500 font-bold">
                            <Star className="w-4 h-4 mr-1 fill-yellow-500" />
                            {user.points}
                          </div>
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">Points</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-green-500 font-bold">
                            <Target className="w-4 h-4 mr-1" />
                            {user.solved_challenges}
                          </div>
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">Solved</span>
                        </div>
                      </div>
                    </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Rest of the Leaderboard */}
          {rest.length > 0 && (
            <Card className="border-border/60 shadow-md">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="text-lg">Rankings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {rest.map((user: any) => (
                    <Link href={`/profile/${user.user_id}`} key={user.user_id} className="flex items-center p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="w-12 text-center font-bold text-lg text-muted-foreground mr-2">
                        #{user.rank}
                      </div>
                      
                      <Avatar className="w-10 h-10 border mr-4">
                        <AvatarImage src={user.avatar_url || ""} alt={user.display_name} />
                        <AvatarFallback>{user.display_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base truncate hover:underline">{user.display_name}</h4>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {user.level}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-right">
                        <div className="hidden sm:block">
                          <div className="flex items-center justify-end text-green-500 font-bold">
                            {user.solved_challenges}
                          </div>
                          <span className="text-xs text-muted-foreground">Solved</span>
                        </div>
                        
                        <div className="w-20">
                          <div className="flex items-center justify-end text-yellow-500 font-bold text-lg">
                            {user.points}
                          </div>
                          <span className="text-xs text-muted-foreground">Points</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
