"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
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

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const items = isAdmin
    ? [
        ...navItems,
        {
          label: "Admin",
          href: "/admin",
          icon: ShieldCheck,
        },
      ]
    : navItems;

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-44 shrink-0 border-r bg-background/95 px-4 py-6 lg:block">
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
                isActive &&
                  "bg-primary/10 text-primary ring-1 ring-primary/15 hover:bg-primary/15 hover:text-primary"
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-md bg-muted/70 transition-colors group-hover:bg-background",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="size-4" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
