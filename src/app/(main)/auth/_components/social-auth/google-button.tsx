"use client";

import { useState } from "react";
import { siGoogle } from "simple-icons";
import { toast } from "sonner";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

export function GoogleButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        toast.error("Google sign-in failed", {
          description: error.message || "Please try again later.",
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="secondary" className={cn(className)} onClick={handleGoogleSignIn} disabled={isLoading} {...props}>
      <SimpleIcon icon={siGoogle} className="size-4" />
      {isLoading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}
