import { getChallengesServer } from "@/lib/server-api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { items, total } = await getChallengesServer(params);

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "intermediate":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "advanced":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
      case "expert":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-10 px-4 md:px-6 space-y-8">
      {/* Header Area */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Challenges</h1>
        <p className="text-muted-foreground text-lg">
          Browse real-world tasks, solve them to earn points, and build your portfolio.
        </p>
      </div>

      {/* Challenge Grid */}
      {items.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No challenges found"
          description="There are no challenges available right now. Check back soon for new ones!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((challenge: any) => (
            <Card key={challenge.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(challenge.difficulty)} variant="outline">
                    {challenge.difficulty.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-none">
                    <Trophy className="h-3 w-3" />
                    {challenge.points} Pts
                  </Badge>
                </div>
                <CardTitle className="text-xl line-clamp-2">{challenge.title}</CardTitle>
                {challenge.project && (
                  <CardDescription className="text-sm font-medium text-primary">
                    {challenge.project.name}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {challenge.description}
                </p>
              </CardContent>
              <CardFooter className="pt-4 border-t">
                <Link href={`/challenges/${challenge.slug}`} className="w-full">
                  <Button className="w-full group" variant="default">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
