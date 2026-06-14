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
  console.log("happaning")
  console.log("profileprofile", profile)
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && (!profile || !["admin", "super_admin"].includes(profile.role))) {
      router.push("/dashboard");
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return <LWFullScreenLoader />;
  }

  if (!profile || !["admin", "super_admin"].includes(profile.role)) return null;

  return <>{children}</>;
}
