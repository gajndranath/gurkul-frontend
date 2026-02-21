import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";
import type {
  AuthSession,
  Student,
  Admin,
  UserRole,
} from "../features/auth/types/auth.types";

interface SessionState {
  token: string | null;
  userId: string | null;
  role: UserRole | null;
  expiresAt: number | null;
  student: Student | null;
  admin: Admin | null;
  rememberMe: boolean;
  _hasHydrated: boolean;
  fcmToken: string | null;
  setHasHydrated: (state: boolean) => void;
  setFcmToken: (token: string | null) => void;
  setSession: (
    session: Partial<AuthSession> & { student?: Student; admin?: Admin },
    rememberMe?: boolean,
  ) => void;
  clearSession: () => void;
  logout: () => void;
  login: (
    token: string,
    userId: string,
    role: UserRole,
    expiresAt: number,
    student?: Student,
    admin?: Admin,
    rememberMe?: boolean,
  ) => void;
  setRememberMe: (remember: boolean) => void;
}

// Removed unused getStorage function

// Use separate keys for student/admin session

export const useSessionStore = create(
  persist<SessionState>(
    (set, get) => ({
      token: null,
      userId: null,
      role: null,
      expiresAt: null,
      student: null,
      admin: null,
      rememberMe: true,
      _hasHydrated: false,
      fcmToken: null,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setFcmToken: (token) => set({ fcmToken: token }),
      setSession: (session, rememberMe = true) => {
        set((state) => ({ ...state, ...session, rememberMe }));
      },
      clearSession: () => {
        set({
          token: null,
          userId: null,
          role: null,
          expiresAt: null,
          student: null,
          admin: null,
          rememberMe: false,
          fcmToken: null,
        });
        localStorage.removeItem("library-auth-cache");
        sessionStorage.removeItem("library-auth-cache");
      },
      logout: () => {
        get().clearSession();
        localStorage.clear();
        sessionStorage.clear();
      },
      login: (
        token: string,
        userId: string,
        role: UserRole,
        expiresAt: number,
        student?: Student,
        admin?: Admin,
        rememberMe: boolean = true,
      ) => {
        set({ token, userId, role, expiresAt, student, admin, rememberMe });
      },
      setRememberMe: (remember) => {
        set((state) => ({ ...state, rememberMe: remember }));
      },
    }),
    {
      name: "library-auth-cache",
      storage: {
        getItem: (name) => {
          const val =
            localStorage.getItem(name) || sessionStorage.getItem(name);
          return val ? JSON.parse(val) : null;
        },
        setItem: (name, value) => {
          const stringValue =
            typeof value === "string" ? value : JSON.stringify(value);
          const state = JSON.parse(stringValue).state;
          if (state.rememberMe) {
            localStorage.setItem(name, stringValue);
          } else {
            sessionStorage.setItem(name, stringValue);
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        },
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

// Cross-tab sync for session state
export function useSessionSync() {
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === "library-auth-cache") {
        window.location.reload();
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
}
