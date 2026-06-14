"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Code,
  Crown,
  Compass,
  User,
  PlusCircle,
  ListTodo,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api-client";
import { toast } from "sonner";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Challenges",
    href: "/challenges",
    icon: Trophy,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: Code,
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: Crown,
  },
  {
    label: "My Journey",
    href: "/my-journey",
    icon: Compass,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const adminItems = [
  {
    label: "Admin Projects",
    href: "/admin/projects",
    icon: ShieldCheck,
  },
  {
    label: "New Challenge",
    href: "/admin/challenges/new",
    icon: PlusCircle,
  },
  {
    label: "Review Queue",
    href: "/admin/review-queue",
    icon: ListTodo,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const items = isAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <aside
      className={cn(
        "relative sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-outline-variant bg-surface-container-low transition-all duration-300 md:flex z-30",
        isExpanded ? "w-[260px] px-3" : "w-[4.5rem] px-2 items-center"
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        className="absolute -right-3 top-6 z-40 flex size-6 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-on-surface-variant shadow-md hover:text-primary hover:scale-110 transition-transform"
      >
        {isExpanded ? <ChevronLeft className="size-3" /> : <ChevronRight className="size-3" />}
      </button>

      <div className={cn("flex flex-1 flex-col py-6", isExpanded ? "items-stretch" : "items-center")}>
        <nav className="flex-1 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary-container text-on-primary-container border-l-[3px] border-primary active-glow"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                  !isExpanded && "justify-center px-0 w-11 border-l-0"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-container-highest/50 group-hover:bg-surface-container-highest"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                {isExpanded && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
