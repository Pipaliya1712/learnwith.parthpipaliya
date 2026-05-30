"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { logout } from "@/app/actions/auth";
import type { Profile } from "@/types";

type AuthContextType = {
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  profile: null,
  isLoading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children, initialProfile = null }: { children: React.ReactNode, initialProfile?: Profile | null }) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch {
      // redirect() throws
    }
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        profile,
        isLoading,
        isAdmin: profile?.role === "admin",
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
