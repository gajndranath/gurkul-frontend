import React, { useEffect, useState } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { AuthService } from "../services/AuthService";
import { useFcm } from "../hooks/useFcm";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider - Ensures session is hydrated and verified before App mount.
 * Prevents "flash of login page" and handles silent re-auth.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { _hasHydrated, token, role } = useSessionStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Global FCM initialization
  useFcm();

  useEffect(() => {
    const initAuth = async () => {
      // 1. Wait for Zustand storage hydration
      if (!_hasHydrated) return;

      try {
        if (token) {
          // TODO: Verify profile with backend if needed to ensure token is still valid
          // This prevents stale localStorage data from showing private routes
          console.log("[Auth] Session resumed for role:", role);
        }
      } catch (error) {
        console.error("[Auth] Initial verification failed:", error);
        AuthService.logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [_hasHydrated, token, role]);

  if (isInitializing || !_hasHydrated) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
          Securing Terminal
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
