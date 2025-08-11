"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";

import { authRecovery, setupAuthErrorHandler } from "@/lib/auth-recovery";
import { createClient } from "@/lib/supabase/client";
import type { AuthContextType, AuthUser, Profile } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
          return;
        }

        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    },
    [supabase],
  );

  useEffect(() => {
    // Setup global auth error handler
    setupAuthErrorHandler();

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error && error.message.includes("refresh_token_not_found")) {
          console.log("🔄 Refresh token error detected, attempting recovery...");
          const recovered = await authRecovery.handleRefreshTokenError();
          if (!recovered) {
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }
          // Try again after recovery
          const {
            data: { session: newSession },
          } = await supabase.auth.getSession();
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            await fetchProfile(newSession.user.id);
          }
        } else {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state change:", event);

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      } else if (event === "TOKEN_REFRESHED") {
        console.log("✅ Token refreshed successfully");
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } else {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error) {
          router.push("/dashboard");
        }

        return { error };
      } catch (error) {
        console.error("Sign in error:", error);
        return { error };
      }
    },
    [supabase.auth, router],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        return { error };
      } catch (error) {
        console.error("Sign up error:", error);
        return { error };
      }
    },
    [supabase.auth],
  );

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/v1/login");
    } catch (error) {
      console.error("Sign out error:", error);
      // Force clear auth state even if signOut fails
      await authRecovery.clearAuthState();
      router.push("/auth/v1/login");
    }
  }, [supabase.auth, router]);

  const signInWithGoogle = useCallback(async () => {
    try {
      // Get the appropriate site URL for the current environment
      const isDevelopment = process.env.NODE_ENV === "development";
      const siteUrl = isDevelopment
        ? typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000"
        : (process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== "undefined" ? window.location.origin : ""));

      console.log("🔄 Google OAuth redirect URL:", `${siteUrl}/auth/callback`);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
        },
      });

      return { error };
    } catch (error) {
      console.error("Google sign in error:", error);
      return { error };
    }
  }, [supabase.auth]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
    }),
    [user, profile, loading, signIn, signUp, signOut, signInWithGoogle],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
