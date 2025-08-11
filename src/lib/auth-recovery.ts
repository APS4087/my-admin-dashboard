"use client";

import { createClient } from "@/lib/supabase/client";

export class AuthRecovery {
  private static instance: AuthRecovery;
  private supabase = createClient();
  private isRecovering = false;
  private recoveryAttempts = 0;
  private maxRecoveryAttempts = 3;

  static getInstance(): AuthRecovery {
    if (!AuthRecovery.instance) {
      AuthRecovery.instance = new AuthRecovery();
    }
    return AuthRecovery.instance;
  }

  /**
   * Attempts to recover from refresh token errors
   */
  async handleRefreshTokenError(): Promise<boolean> {
    if (this.isRecovering || this.recoveryAttempts >= this.maxRecoveryAttempts) {
      return false;
    }

    this.isRecovering = true;
    this.recoveryAttempts++;

    // Dispatch recovery start event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-recovery-start"));
    }

    try {
      console.log(`🔄 Attempting auth recovery (${this.recoveryAttempts}/${this.maxRecoveryAttempts})...`);

      // Try to get a fresh session
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession();

      if (error || !session) {
        console.log("❌ No valid session found, clearing auth state");
        await this.clearAuthState();
        return false;
      }

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at <= now) {
        console.log("⏰ Session expired, attempting refresh");

        const { error: refreshError } = await this.supabase.auth.refreshSession();
        if (refreshError) {
          console.log("❌ Refresh failed, clearing auth state");
          await this.clearAuthState();
          return false;
        }
      }

      console.log("✅ Auth recovery successful");
      this.recoveryAttempts = 0;
      return true;
    } catch (error) {
      console.error("❌ Auth recovery failed:", error);
      return false;
    } finally {
      this.isRecovering = false;

      // Dispatch recovery complete event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-recovery-complete"));
      }
    }
  }

  /**
   * Clears all authentication state
   */
  async clearAuthState(): Promise<void> {
    try {
      await this.supabase.auth.signOut({ scope: "local" });

      // Clear any auth-related cookies/storage
      if (typeof window !== "undefined") {
        // Clear localStorage items that might contain auth data
        const authKeys = Object.keys(localStorage).filter((key) => key.includes("supabase") || key.includes("auth"));
        authKeys.forEach((key) => localStorage.removeItem(key));

        // Clear sessionStorage
        const sessionAuthKeys = Object.keys(sessionStorage).filter(
          (key) => key.includes("supabase") || key.includes("auth"),
        );
        sessionAuthKeys.forEach((key) => sessionStorage.removeItem(key));
      }

      console.log("🧹 Auth state cleared");
    } catch (error) {
      console.error("❌ Error clearing auth state:", error);
    }
  }

  /**
   * Resets recovery attempts counter
   */
  resetRecoveryAttempts(): void {
    this.recoveryAttempts = 0;
  }

  /**
   * Checks if we're currently in a recovery process
   */
  isCurrentlyRecovering(): boolean {
    return this.isRecovering;
  }
}

// Export singleton instance
export const authRecovery = AuthRecovery.getInstance();

/**
 * Global error handler for auth errors
 */
export function setupAuthErrorHandler() {
  if (typeof window === "undefined") return;

  // Capture unhandled auth errors
  const originalError = console.error;
  console.error = (...args) => {
    const errorMsg = args.join(" ");

    if (
      errorMsg.includes("refresh_token_not_found") ||
      errorMsg.includes("Invalid Refresh Token") ||
      errorMsg.includes("AuthApiError")
    ) {
      // Debounce recovery attempts
      setTimeout(() => {
        authRecovery.handleRefreshTokenError();
      }, 1000);
    }

    originalError(...args);
  };

  // Listen for auth state changes
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      authRecovery.resetRecoveryAttempts();
    }
  });
}
