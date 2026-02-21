import { useSessionStore } from "../stores/sessionStore";
import type { AuthSession, UserRole } from "../features/auth/types/auth.types";

/**
 * AuthService - SaaS Level Abstraction
 * Centralizes all security and session operations.
 */
export class AuthService {
  /**
   * Reconciles current session state
   */
  static getSession() {
    return useSessionStore.getState();
  }

  /**
   * Securely sets a new session
   */
  static setSession(session: Partial<AuthSession>, rememberMe: boolean = true) {
    useSessionStore.getState().setSession(session, rememberMe);
  }

  /**
   * Handles multi-tab logout and cleanup
   */
  static async logout() {
    const { logout } = useSessionStore.getState();
    
    // 1. Local cleanup
    logout();
    
    // 2. Broadcast logout to other tabs via storage event if needed 
    // (Zustand persist handles most of this, but manual broadcast is safer for immediate logout)
    localStorage.removeItem("library-auth-cache");
    localStorage.setItem("logout-event", Date.now().toString());
  }

  /**
   * Logic to determine if we should attempt a background refresh
   */
  static shouldRefresh(): boolean {
    const { token, expiresAt } = useSessionStore.getState();
    if (!token || !expiresAt) return false;
    
    // Refresh if within 5 minutes of expiry or simply if 401 occurs
    const buffer = 5 * 60 * 1000;
    return Date.now() > (expiresAt - buffer);
  }

  /**
   * Standardizes role hierarchy checks
   */
  static isAuthorized(requiredRole: string, userRole: UserRole | null): boolean {
    if (!userRole) return false;
    if (requiredRole === "ADMIN") {
      return ["ADMIN", "SUPER_ADMIN", "STAFF"].includes(userRole);
    }
    return userRole === requiredRole;
  }
}
