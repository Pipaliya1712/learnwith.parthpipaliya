"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LWFullScreenLoader } from "@/components/ui/lw-fullscreen-loader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !profile) {
      router.push("/login");
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return <LWFullScreenLoader />;
  }

  if (!profile) return null;

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!profile || profile.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return <LWFullScreenLoader />;
  }

  if (!profile || profile.role !== "admin") return null;

  return <>{children}</>;
}
