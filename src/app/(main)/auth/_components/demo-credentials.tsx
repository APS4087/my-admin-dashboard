"use client";

import { useState } from "react";

import { Info, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DemoCredentials() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);

      // Reset copy state after 2 seconds
      setTimeout(() => setCopiedField(null), 2000);
    } catch (_err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Card className="border-2 border-dashed border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
          <Info className="h-4 w-4" />
          Development Mode - Demo Credentials
        </CardTitle>
        <CardDescription className="text-xs text-amber-700 dark:text-amber-300">
          Use these credentials to test the login functionality in development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          <div className="bg-background/50 flex items-center justify-between rounded p-2">
            <div className="text-xs">
              <div className="text-muted-foreground font-medium">Email:</div>
              <div className="font-mono">demo@admin.com</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => copyToClipboard("demo@admin.com", "Email")}
            >
              {copiedField === "Email" ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          <div className="bg-background/50 flex items-center justify-between rounded p-2">
            <div className="text-xs">
              <div className="text-muted-foreground font-medium">Password:</div>
              <div className="font-mono">password123</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => copyToClipboard("password123", "Password")}
            >
              {copiedField === "Password" ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">
          💡 Click the copy icons to quickly fill the form fields
        </div>
      </CardContent>
    </Card>
  );
}
