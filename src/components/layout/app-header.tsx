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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Menu, LayoutDashboard, Settings, ShieldCheck, Sparkles, Trophy, Code, Crown, Compass } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/challenges": "Challenges",
  "/projects": "Projects Explorer",
  "/leaderboard": "Leaderboard",
  "/my-journey": "My Journey",
  "/settings": "Settings",
  "/profile": "Profile",
  "/admin/projects": "Manage Projects",
  "/admin/users": "Manage Users",
  "/admin/challenges/new": "New Challenge",
  "/admin/review-queue": "Review Queue",
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function AppHeader() {
  const { profile, signOut, isAdmin } = useAuth();
  const pathname = usePathname();

  const pageLabel = routeLabels[pathname] ?? "";

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Challenges", href: "/challenges", icon: Trophy },
    { label: "Projects", href: "/projects", icon: Code },
    { label: "Leaderboard", href: "/leaderboard", icon: Crown },
    { label: "My Journey", href: "/my-journey", icon: Compass },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const adminItems = [
    { label: "Admin Projects", href: "/admin/projects", icon: ShieldCheck },
    { label: "New Challenge", href: "/admin/challenges/new", icon: ShieldCheck },
    { label: "Review Queue", href: "/admin/review-queue", icon: ShieldCheck },
  ];

  const items = isAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1450px] items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Left: Mobile Menu + Logo + Breadcrumb */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="md:hidden" />}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-surface-container-low border-r border-outline-variant">
              <SheetHeader className="p-4 text-left border-b border-outline-variant">
                <SheetTitle className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent flex items-center gap-2">
                  <Sparkles className="size-5 text-primary active-glow" />
                  Learn With 2.0
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col py-4">
                <nav className="flex-1 space-y-1 px-2">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary-container text-on-primary-container active-glow font-semibold"
                            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <Sparkles className="size-5 text-primary animate-pulse" />
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              Learn With 2.0
            </span>
          </Link>

          {pageLabel && (
            <>
              <ChevronRight className="hidden md:block size-4 text-on-surface-variant/40" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider text-glow-cyan">
                {pageLabel}
              </span>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="relative flex items-center gap-2 rounded-full pl-1 pr-3 hover:bg-surface-container-high focus-visible:ring-1 focus-visible:ring-ring border border-outline-variant/30"
                />
              }
            >
              <Avatar size="sm" className="border border-primary/20">
                <AvatarImage
                  src={profile?.avatar_url ?? undefined}
                  alt={profile?.display_name || "User"}
                />
                <AvatarFallback className="bg-surface-container-highest text-primary">
                  {getInitials(profile?.display_name || profile?.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline-block text-on-surface">
                {profile?.display_name || profile?.email?.split("@")[0] || "User"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-surface-container-low border border-outline-variant">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs leading-none text-on-surface-variant truncate">
                      {profile?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-outline-variant/30" />
              <DropdownMenuItem
                render={<Link href="/profile" className="cursor-pointer w-full flex items-center" />}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-outline-variant/30" />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer flex items-center text-red-400 hover:bg-red-500/10"
                onClick={async () => {
                  try {
                    await signOut();
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
