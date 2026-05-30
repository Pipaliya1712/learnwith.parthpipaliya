"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { profile, isAdmin, signOut } = useAuth();
  console.log("profileprofile", profile)
  const pathname = usePathname();

  const pageLabel = routeLabels[pathname] ?? "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </Link>

          {pageLabel && (
            <>
              <ChevronRight className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {pageLabel}
              </span>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="relative flex items-center gap-2 rounded-full pl-1 pr-3"
                  aria-label="User menu"
                />
              }
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
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium truncate">
                    {profile?.display_name || profile?.email || "User"}
                  </span>
                  {!profile?.display_name && !profile?.email && (
                    <span className="text-xs text-muted-foreground truncate">
                      User
                    </span>
                  )}
                  {profile?.display_name && profile?.email && (
                    <span className="text-xs text-muted-foreground truncate">
                      {profile?.email}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  render={<Link href="/dashboard" />}
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem
                  render={<Link href="/settings" />}
                >
                  <Settings className="size-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuItem
                  render={<Link href="/profile" />}
                >
                  <User className="size-4" />
                  Profile
                </DropdownMenuItem>

                {isAdmin && (
                  <DropdownMenuItem
                    render={<Link href="/admin" />}
                  >
                    <Settings className="size-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut()}
              >
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
