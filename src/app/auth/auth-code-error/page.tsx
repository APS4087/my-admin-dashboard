import { Suspense } from "react";

import Link from "next/link";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function ErrorDetails({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const error = searchParams.error;
  const description = searchParams.description;

  if (process.env.NODE_ENV === "development" && (error || description)) {
    return (
      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
        <p className="mb-1 text-xs font-medium text-red-800 dark:text-red-200">Debug Info (Development Only):</p>
        {error && <p className="text-xs text-red-700 dark:text-red-300">Error: {error}</p>}
        {description && <p className="text-xs text-red-700 dark:text-red-300">Description: {description}</p>}
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          💡 Make sure your redirect URLs are configured correctly in Supabase for localhost:3000
        </p>
      </div>
    );
  }

  return null;
}

export default async function AuthCodeError({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>Sorry, we encountered an error during the authentication process.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This could be due to an expired or invalid authentication code. Please try signing in again.
          </p>

          <Suspense fallback={null}>
            <ErrorDetails searchParams={resolvedSearchParams} />
          </Suspense>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href="/auth/v1/login">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
