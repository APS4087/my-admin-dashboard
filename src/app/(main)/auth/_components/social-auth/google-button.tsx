"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";
import { siGoogle } from "simple-icons";
import { toast } from "sonner";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function GoogleButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        toast.error("Google sign-in failed", {
          description: error.message ?? "Please try again later.",
        });
      }
    } catch (_error) {
      toast.error("An unexpected error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className={cn(
        "hover:border-primary/20 h-11 w-full border-2 text-sm font-medium transition-all duration-200 hover:shadow-md disabled:opacity-70",
        className,
      )}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <SimpleIcon icon={siGoogle} className="mr-2 h-4 w-4" />
          Continue with Google
        </>
      )}
    </Button>
  );
}
