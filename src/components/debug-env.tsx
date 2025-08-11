"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";

export function DebugEnv() {
  const { user, loading } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [authErrors, setAuthErrors] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !isClient) return;

    const supabase = createClient();

    // Get current session info
    const getSessionInfo = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          setAuthErrors((prev) => [...prev, `Session Error: ${error.message}`]);
        }
        setSessionInfo(session);
      } catch (err) {
        setAuthErrors((prev) => [...prev, `Session Fetch Error: ${err}`]);
      }
    };

    getSessionInfo();

    // Listen for auth state changes and errors
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") {
        console.log("✅ Token refreshed successfully");
        setAuthErrors((prev) => prev.filter((error) => !error.includes("refresh")));
      } else if (event === "SIGNED_OUT") {
        setAuthErrors([]);
        setSessionInfo(null);
      }
      setSessionInfo(session);
    });

    // Listen for auth errors
    const originalError = console.error;
    console.error = (...args) => {
      const errorMsg = args.join(" ");
      if (errorMsg.includes("refresh_token_not_found") || errorMsg.includes("AuthApiError")) {
        setAuthErrors((prev) => {
          const newError = `Auth Error: ${errorMsg}`;
          return prev.includes(newError) ? prev : [...prev.slice(-2), newError];
        });
      }
      originalError(...args);
    };

    return () => {
      subscription.unsubscribe();
      console.error = originalError;
    };
  }, [isClient]);

  // Don't render anything until client-side hydration is complete
  if (process.env.NODE_ENV !== "development" || !isClient) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 max-h-96 max-w-sm overflow-y-auto rounded bg-black p-2 text-xs text-white">
      <div className="mb-2 font-bold text-green-400">🐛 Debug Info</div>

      <div className="mb-2">
        <div className="text-blue-300">Environment:</div>
        <div>NODE_ENV: {process.env.NODE_ENV}</div>
        <div>SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL ?? "undefined"}</div>
        <div>Origin: {window.location.origin}</div>
        <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</div>
      </div>

      <div className="mb-2">
        <div className="text-blue-300">Auth Status:</div>
        <div>Loading: {loading ? "✅" : "❌"}</div>
        <div>User: {user ? `✅ ${user.email}` : "❌ Not logged in"}</div>
        <div>
          Session:{" "}
          {sessionInfo
            ? `✅ Expires: ${new Date(sessionInfo.expires_at * 1000).toLocaleTimeString()}`
            : "❌ No session"}
        </div>
      </div>

      {authErrors.length > 0 && (
        <div className="mb-2">
          <div className="text-red-300">Recent Auth Errors:</div>
          {authErrors.map((error, i) => (
            <div key={i} className="text-xs break-words text-red-200">
              {error.length > 80 ? `${error.substring(0, 80)}...` : error}
            </div>
          ))}
          <button onClick={() => setAuthErrors([])} className="mt-1 rounded bg-red-600 px-1 text-xs hover:bg-red-700">
            Clear Errors
          </button>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-400">
        Refresh token errors are common in dev mode and usually resolve automatically.
      </div>
    </div>
  );
}
