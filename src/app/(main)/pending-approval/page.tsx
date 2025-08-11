"use client";

import { Clock, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export default function PendingApprovalPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Account Pending Approval</CardTitle>
            <CardDescription>
              Your account has been created successfully, but requires admin approval before you can access the system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/50">
                <div className="flex items-start space-x-3">
                  <Mail className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Approval Required</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Please contact an administrator to approve your account.
                    </p>
                  </div>
                </div>
              </div>

              {user && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <div className="flex items-start space-x-3">
                    <Lock className="mt-0.5 h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Account Details</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email: {user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button onClick={signOut} variant="outline" className="w-full">
                Sign Out
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Need help? Contact your administrator for assistance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
