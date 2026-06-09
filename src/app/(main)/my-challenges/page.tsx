import { getMyChallengesServer } from "@/lib/server-api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, CheckCircle2, XCircle, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function MyChallengesPage() {
  const { items, total } = await getMyChallengesServer();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "in_progress":
        return {
          label: "In Progress",
          color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
          icon: <Activity className="w-3 h-3 mr-1" />,
          actionText: "Continue Work",
          actionVariant: "default" as const,
        };
      case "submitted":
        return {
          label: "Under Review",
          color: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
          icon: <Clock className="w-3 h-3 mr-1" />,
          actionText: "View Submission",
          actionVariant: "secondary" as const,
        };
      case "approved":
        return {
          label: "Approved",
          color: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
          icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
          actionText: "Review Feedback",
          actionVariant: "outline" as const,
        };
      case "rejected":
        return {
          label: "Changes Requested",
          color: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
          icon: <XCircle className="w-3 h-3 mr-1" />,
          actionText: "View Feedback",
          actionVariant: "destructive" as const,
        };
      default:
        return {
          label: status,
          color: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20",
          icon: null,
          actionText: "View Details",
          actionVariant: "outline" as const,
        };
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-10 px-4 md:px-6 space-y-8">
      {/* Header Area */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Challenges</h1>
        <p className="text-muted-foreground text-lg">
          Track your progress, continue working on challenges, and review feedback.
        </p>
      </div>

      {/* Stats/Summary could go here in the future */}

      {/* Challenge Grid */}
      {items.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/20">
          <p className="text-muted-foreground text-lg">You haven't claimed any challenges yet.</p>
          <Link href="/challenges">
            <Button className="mt-4">Browse Challenges</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((claim: any) => {
            const config = getStatusConfig(claim.status);
            
            return (
              <Card key={claim.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Optional Top Border Accent based on status */}
                <div className={`h-1 w-full absolute top-0 left-0 ${config.color.split(' ')[0].replace('/10', '')}`} />
                
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`${config.color} flex items-center border-none`} variant="outline">
                      {config.icon}
                      {config.label}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-none">
                      <Trophy className="h-3 w-3" />
                      {claim.challenge.points} Pts
                    </Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-2 mt-2">{claim.challenge.title}</CardTitle>
                  {claim.challenge.project && (
                    <CardDescription className="text-sm font-medium text-primary">
                      {claim.challenge.project.name}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center text-xs text-muted-foreground mt-4">
                    <Clock className="mr-1 h-3 w-3" />
                    Last updated {formatDistanceToNow(new Date(claim.updated_at), { addSuffix: true })}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-muted/10">
                  <Link href={`/challenges/${claim.challenge.slug}`} className="w-full">
                    <Button className="w-full group" variant={config.actionVariant}>
                      {config.actionText}
                      <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
