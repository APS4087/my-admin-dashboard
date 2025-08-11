import { Suspense } from "react";

import Link from "next/link";

import { Command } from "lucide-react";

import { AuthErrorHandler, AuthRecoveryStatus } from "@/components/auth-error-handler";

import { LoginForm } from "../../_components/login-form";
import { GoogleButton } from "../../_components/social-auth/google-button";

export default function LoginV1() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="from-primary via-primary/90 to-primary/80 relative hidden overflow-hidden bg-gradient-to-br lg:flex lg:w-2/5">
        {/* Background pattern */}
        <div className="from-primary/20 absolute inset-0 bg-gradient-to-br to-transparent"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-center">
          <div className="space-y-8">
            {/* Logo and branding */}
            <div className="space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                <Command className="text-primary-foreground h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-primary-foreground text-4xl font-bold">Welcome back</h1>
                <p className="text-primary-foreground/80 mx-auto max-w-md text-lg">
                  Access your admin dashboard and manage your ship fleet with ease
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="bg-background flex w-full items-center justify-center p-6 lg:w-3/5">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="mb-6 lg:hidden">
              <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
                <Command className="text-primary h-6 w-6" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
            <p className="text-muted-foreground">Enter your credentials to access the dashboard</p>
          </div>

          {/* Auth messages */}
          <Suspense fallback={null}>
            <AuthErrorHandler />
            <AuthRecoveryStatus />
          </Suspense>

          {/* Login form */}
          <div className="space-y-6">
            <LoginForm />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="border-muted w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">Or continue with</span>
              </div>
            </div>

            {/* Social login */}
            <GoogleButton />
          </div>

          {/* Footer */}
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm">
              Don&apos;t have an account?{" "}
              <Link href="register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Create account
              </Link>
            </p>
            <p className="text-muted-foreground text-xs">
              By signing in, you agree to our{" "}
              <Link href="#" className="hover:text-foreground underline transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="hover:text-foreground underline transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
