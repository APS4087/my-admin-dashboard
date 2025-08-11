"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

export function AuthErrorHandler() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const messageParam = searchParams.get("message");

    if (errorParam) {
      switch (errorParam) {
        case "session_expired":
          setError("Your session has expired. Please sign in again.");
          break;
        case "auth_error":
          setError("An authentication error occurred. Please try signing in again.");
          break;
        case "refresh_token_not_found":
          setError("Session error detected. Please sign in again.");
          break;
        default:
          setError("An error occurred. Please try again.");
      }
    }

    if (messageParam) {
      setMessage(messageParam);
    }

    // Clear URL params after showing the error
    if (errorParam || messageParam) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      newUrl.searchParams.delete("message");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
        </div>
      </div>
    );
  }

  return null;
}

export function AuthRecoveryStatus() {
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    // Listen for auth recovery events
    const handleAuthRecovery = () => setIsRecovering(true);
    const handleAuthRecoveryComplete = () => setIsRecovering(false);

    // Custom events that can be dispatched from auth recovery
    window.addEventListener("auth-recovery-start", handleAuthRecovery);
    window.addEventListener("auth-recovery-complete", handleAuthRecoveryComplete);

    return () => {
      window.removeEventListener("auth-recovery-start", handleAuthRecovery);
      window.removeEventListener("auth-recovery-complete", handleAuthRecoveryComplete);
    };
  }, []);

  if (!isRecovering) return null;

  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-blue-800 dark:text-blue-200">Recovering authentication session...</p>
      </div>
    </div>
  );
}
