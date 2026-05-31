"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/projects": "Projects",
  "/dashboard/settings": "Settings",
  "/admin": "Admin",
  "/admin/projects": "Manage Projects",
  "/admin/users": "Manage Users",
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function AppHeader() {
  const { profile } = useAuth();
  const pathname = usePathname();

  const pageLabel = routeLabels[pathname] ?? "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1450px] items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Left: Logo + Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </Link>

          {pageLabel && (
            <>
              <ChevronRight className="size-4 text-muted-foreground" />
              <span className="text-base font-medium text-muted-foreground">
                {pageLabel}
              </span>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button
            variant="ghost"
            className="relative flex items-center gap-2 rounded-full pl-1 pr-3"
            aria-label="Open profile"
            render={<Link href="/profile" />}
          >
              <Avatar size="sm">
                <AvatarImage
                  src={profile?.avatar_url ?? undefined}
                  alt={profile?.display_name || "User"}
                />
                <AvatarFallback>
                  {getInitials(profile?.display_name || profile?.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline-block">
                {profile?.display_name || profile?.email?.split("@")[0] || "User"}
              </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
