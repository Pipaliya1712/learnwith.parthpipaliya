"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { authApi } from "@/lib/api-client";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  return (
    <aside
      className={cn(
        "relative sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col border-r bg-background/95 transition-all duration-300 md:flex",
        isExpanded ? "w-48 px-4" : "w-[4.5rem] px-2 items-center"
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        className="absolute -right-3 top-6 z-10 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground hover:scale-110 transition-transform"
      >
        {isExpanded ? <ChevronLeft className="size-3" /> : <ChevronRight className="size-3" />}
      </button>
      <div className={cn("flex flex-1 flex-col py-6", isExpanded ? "items-stretch" : "items-center")}>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
                  isActive && "bg-primary/10 text-primary ring-1 ring-primary/15 hover:bg-primary/15 hover:text-primary",
                  !isExpanded && "justify-center px-0 w-11"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground group-hover:bg-background group-hover:text-foreground"
                      : "bg-muted/70 group-hover:bg-background",
                    !isExpanded && "size-11"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                {isExpanded && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t w-full flex flex-col items-center">
          <button
            onClick={handleLogout}
            title={!isExpanded ? "Logout" : undefined}
            className={cn(
              "group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive",
              !isExpanded && "justify-center px-0 w-11"
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/70 transition-colors group-hover:bg-background",
                !isExpanded && "size-11"
              )}
            >
              <LogOut className="size-4 text-destructive" />
            </span>
            {isExpanded && <span className="text-destructive">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
