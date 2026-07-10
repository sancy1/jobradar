"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { GoogleIcon, GitHubIcon } from "@/components/social-icons";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { RadarLogo } from "@/components/radar-logo";
import { BackgroundSlider } from "@/components/background-slider";
import { AuthMarketing } from "@/components/auth-marketing";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithGoogle, signUpWithGitHub, isLoading } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGoogleSignUp = async () => {
    if (!agreedToTerms) {
      toast.error("Please accept the terms", {
        description: "You must agree to the Terms of Service and Privacy Policy to continue",
      });
      return;
    }

    setLoadingProvider("google");
    try {
      await signUpWithGoogle();
      setShowSuccess(true);
      toast.success("Account created!", {
        description: "Welcome to JobRadar! Your account has been created",
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("Sign up failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGitHubSignUp = async () => {
    if (!agreedToTerms) {
      toast.error("Please accept the terms", {
        description: "You must agree to the Terms of Service and Privacy Policy to continue",
      });
      return;
    }

    setLoadingProvider("github");
    try {
      await signUpWithGitHub();
      setShowSuccess(true);
      toast.success("Account created!", {
        description: "Welcome to JobRadar! Your account has been created",
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("Sign up failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  if (showSuccess) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
        <BackgroundSlider />
        <div className="relative z-10 text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-cyan-500 flex items-center justify-center shadow-2xl">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to JobRadar!
          </h1>
          <p className="text-slate-300">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Background Slider */}
      <BackgroundSlider />

      {/* Top Bar */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between">
        <div className="lg:hidden">
          <RadarLogo size="sm" />
        </div>
        <div className="hidden lg:block" />
        <ThemeToggle />
      </header>

      {/* Main Content - Split Layout */}
      <main className="relative z-10 flex-1 flex items-stretch">
        {/* Left: Marketing Section (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-3/5 xl:w-3/5">
          <AuthMarketing />
        </div>

        {/* Right: Sign Up Card */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 lg:px-8 -mt-8">
          <div className="w-full max-w-md">
            {/* Mobile heading */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-2xl font-bold text-white">
                Find your dream job with{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  radar precision
                </span>
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-sm mx-auto">
                Create your account and start your job discovery journey
              </p>
            </div>

            {/* Sign Up Card */}
            <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
              {/* Card Header */}
              <div className="px-8 pt-8 pb-2 text-center">
                {/* <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-7 w-7 text-white" />
                </div> */}
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Create your account
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Start your job discovery journey today
                </p>
              </div>

              {/* Card Body */}
              <div className="px-8 py-6 space-y-4">
                {/* Info Box */}
                <div className="rounded-lg border border-cyan-200 dark:border-cyan-900 bg-cyan-50 dark:bg-cyan-950/20 p-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
                        No Password
                      </Badge>
                    </div>
                    <p className="text-sm text-cyan-800 dark:text-cyan-200">
                      No password needed — just use your social account. Your account is created automatically.
                    </p>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start space-x-3 py-1">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal leading-snug cursor-pointer"
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>

                <TooltipProvider>
                  <div className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 text-base font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200 disabled:opacity-50"
                          onClick={handleGoogleSignUp}
                          disabled={isLoading || !agreedToTerms}
                        >
                          {loadingProvider === "google" ? (
                            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                          ) : (
                            <GoogleIcon className="mr-3" />
                          )}
                          Sign up with Google
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-sm">Your account will be created automatically with basic info from Google. We&apos;ll never post without permission.</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 text-base font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200 disabled:opacity-50"
                          onClick={handleGitHubSignUp}
                          disabled={isLoading || !agreedToTerms}
                        >
                          {loadingProvider === "github" ? (
                            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                          ) : (
                            <GitHubIcon className="mr-3 dark:text-slate-200" />
                          )}
                          Sign up with GitHub
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-sm">Perfect for developers! Your account will sync with your GitHub profile automatically.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400 font-medium">
                      or
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{" "}
                    <Link
                      href="/auth/signin"
                      className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                      Sign in
                    </Link>
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-8 pb-6 pt-2">
                <div className="text-xs text-slate-500 dark:text-slate-500 text-center">
                  <span className="flex items-center justify-center gap-4">
                    <Link
                      href="/terms"
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      Terms of Service
                    </Link>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <Link
                      href="/privacy"
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-xs text-slate-400">
        JobRadar — Start your job discovery journey
      </footer>
    </div>
  );
}
