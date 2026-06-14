"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Shield } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PublicUser } from "@/types";

type UserCardProps = {
  user: PublicUser;
};

export function UserCard({ user }: UserCardProps) {
  const displayName = user.display_name || "Anonymous";
  const fallback = displayName[0].toUpperCase();

  return (
    <Link
      href={`/profile/${user.id}`}
      className="group block"
    >
      <div
        className={cn(
          "card-hover flex flex-col items-center gap-4 rounded-2xl border border-border/80 bg-card/80 p-6 text-center shadow-sm ring-1 ring-foreground/5",
          "transition-all hover:border-primary/45 hover:bg-card hover:shadow-xl hover:shadow-primary/10"
        )}
      >
        <Avatar className="h-20 w-20 text-2xl shrink-0">
          {user.avatar_url && (
            <AvatarImage src={user.avatar_url} alt={displayName} />
          )}
          <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">
            {fallback}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 space-y-2">
          <h3 className="truncate text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
            {displayName}
          </h3>

          <Badge variant="secondary" className="capitalize text-xs">
            {user.role}
          </Badge>

          <div className="flex flex-col items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Joined {format(new Date(user.created_at), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
