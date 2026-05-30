"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

function LinkButton({
  href,
  children,
  variant = "default",
  size = "sm",
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "icon";
  className?: string;
  onClick?: () => void;
}) {
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const sizes = { sm: "h-8 px-3 text-xs", default: "h-9 px-4 py-2", icon: "h-9 w-9" };
  const variants = {
    default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { profile, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          {isLoading ? null : profile ? (
            <LinkButton href="/dashboard">Dashboard</LinkButton>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost">Login</LinkButton>
              <LinkButton href="/signup">Sign Up</LinkButton>
            </>
          )}
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    {APP_NAME}
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-3 px-4 pt-2">
                {isLoading ? null : profile ? (
                  <LinkButton href="/dashboard" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </LinkButton>
                ) : (
                  <>
                    <LinkButton href="/login" variant="ghost" onClick={() => setMobileOpen(false)}>
                      Login
                    </LinkButton>
                    <LinkButton href="/signup" onClick={() => setMobileOpen(false)}>
                      Sign Up
                    </LinkButton>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
