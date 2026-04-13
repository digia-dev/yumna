"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useMemo } from "react";

/**
 * useAuth Hook
 * Centralized authentication and user state management for Yumna Frontend.
 */
export const useAuth = () => {
  const result = useSession();
  
  const session = result?.data;
  const status = result?.status || "loading";

  const user = session?.user;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const isKepalaKeluarga = useMemo(() => user?.role === "KEPALA_KELUARGA", [user]);
  const isIstri = useMemo(() => user?.role === "ISTRI", [user]);
  const isAnak = useMemo(() => user?.role === "ANAK", [user]);

  const hasFamily = !!user?.familyId;

  return {
    user,
    status,
    isLoading,
    isAuthenticated,
    isKepalaKeluarga,
    isIstri,
    isAnak,
    hasFamily,
    signIn,
    signOut,
  };
};
