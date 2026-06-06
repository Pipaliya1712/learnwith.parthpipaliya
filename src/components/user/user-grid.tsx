"use client";

import { UserCard } from "@/components/user/user-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, RefreshCcw, Search, UserCheck } from "lucide-react";
import type { PublicUser } from "@/types";

type UserGridProps = {
  users: PublicUser[];
  isLoading?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
};

const skeletons = Array.from({ length: 6 });

export function UserGrid({
  users,
  isLoading,
  hasActiveFilters,
  onClearFilters,
}: UserGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {skeletons.map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-4 rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm"
          >
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="w-full space-y-2 text-center">
              <Skeleton className="mx-auto h-5 w-28" />
              <Skeleton className="mx-auto h-5 w-16 rounded-full" />
              <div className="space-y-1.5 pt-1">
                <Skeleton className="mx-auto h-3 w-24" />
                <Skeleton className="mx-auto h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="space-y-8 py-8 text-center">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <div className="relative mb-8 flex h-48 w-48 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/5" />
            <div className="absolute inset-4 rounded-full bg-primary/10" />
            <Users className="relative h-20 w-20 text-muted-foreground/40" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight">No users found</h2>
          <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
            We couldn&apos;t find any users matching your search. Try adjusting
            your search terms.
          </p>
          {hasActiveFilters && (
            <Button
              className="mt-6 h-11 gap-2 bg-primary px-6 shadow-lg shadow-primary/20"
              onClick={onClearFilters}
            >
              <RefreshCcw className="size-4" />
              Clear search
            </Button>
          )}
        </div>

        <div className="mx-auto max-w-3xl rounded-xl border bg-card/35 p-6 text-left shadow-sm">
          <h3 className="mb-5 text-sm font-semibold">Try these suggestions</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Search,
                title: "Check your search",
                description:
                  "Make sure the name is spelled correctly, or try a partial name.",
              },
              {
                icon: UserCheck,
                title: "Browse all users",
                description:
                  "Clear the search field to see all active members.",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="space-y-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground shadow-sm">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
