"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { CheckCircle2, Mail, Shield, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { profile, isLoading } = useAuth();

  if (isLoading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="shimmer h-8 w-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">View your account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl">
                {(profile.display_name || profile.email)[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-4 text-center sm:text-left">
              <div>
                <p className="font-bold text-3xl">
                  {profile.display_name || "No name set"}
                </p>
              </div>
              
              <div className="flex flex-col items-center sm:items-start gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                  {profile.email_verified ? (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Unverified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">{profile.role}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(new Date(profile.created_at), "MMMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
