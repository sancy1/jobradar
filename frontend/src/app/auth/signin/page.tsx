"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { GoogleIcon, GitHubIcon } from "@/components/social-icons";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { RadarLogo } from "@/components/radar-logo";
import { BackgroundSlider, sliderSlides } from "@/components/background-slider";
import { AuthMarketing } from "@/components/auth-marketing";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const {
    signInWithGoogle,
    signInWithGitHub,
    isLoading,
    loginAttempts,
    maxAttempts,
    resetAttempts,
  } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);
  const remainingAttempts = maxAttempts - loginAttempts;

  const handleGoogleSignIn = async () => {
    setLoadingProvider("google");
    try {
      await signInWithGoogle();
      toast.success("Successfully signed in!", {
        description: "Welcome back to JobRadar",
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      toast.error("Sign in failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoadingProvider("github");
    try {
      await signInWithGitHub();
      toast.success("Successfully signed in!", {
        description: "Welcome back to JobRadar",
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      toast.error("Sign in failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoadingProvider(null);
    }
  };

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

        {/* Right: Login Card */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 lg:px-8 lg:py-12">
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
                AI-powered job matching that finds roles tailored to your skills
              </p>
            </div>

            {/* Login Card */}
            <div className="relative">
              {/* Active slide caption (floating above card) */}
              <div className="hidden lg:block mb-4 text-right">
                <SlideCaption />
              </div>

              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                {/* Card Header */}
                <div className="px-8 pt-8 pb-2 text-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Welcome back
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Sign in to continue your job discovery
                  </p>
                </div>

                {/* Card Body */}
                <div className="px-8 py-6 space-y-4">
                  {remainingAttempts <= 2 && remainingAttempts > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div>
                          <h5 className="mb-1 font-medium text-amber-800 dark:text-amber-400">Warning</h5>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            {remainingAttempts} login attempt{remainingAttempts === 1 ? "" : "s"} remaining
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {loginAttempts >= maxAttempts && (
                    <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20 p-4 text-sm">
                      <div className="flex gap-3">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <h5 className="mb-1 font-medium text-red-800 dark:text-red-400">Account locked</h5>
                          <p className="text-red-700 dark:text-red-300">
                            Too many failed attempts. Please wait before trying again or
                            <Button
                              variant="link"
                              className="h-auto p-0 ml-1 text-red-600"
                              onClick={resetAttempts}
                            >
                              reset attempts
                            </Button>
                            .
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <TooltipProvider>
                    <div className="space-y-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 text-base font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200 disabled:opacity-50"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading || loginAttempts >= maxAttempts}
                          >
                            {loadingProvider === "google" ? (
                              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                            ) : (
                              <GoogleIcon className="mr-3" />
                            )}
                            Continue with Google
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">Sign in with your Google account. We&apos;ll never post without your permission.</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 text-base font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200 disabled:opacity-50"
                            onClick={handleGitHubSignIn}
                            disabled={isLoading || loginAttempts >= maxAttempts}
                          >
                            {loadingProvider === "github" ? (
                              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                            ) : (
                              <GitHubIcon className="mr-3 dark:text-slate-200" />
                            )}
                            Continue with GitHub
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">Sign in with your GitHub account for seamless integration with developer profiles.</p>
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
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/auth/signup"
                        className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                      >
                        Sign up
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
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-xs text-slate-400">
        JobRadar — Discover your next opportunity
      </footer>
    </div>
  );
}

function SlideCaption() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % sliderSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = sliderSlides[index];

  return (
    <div key={index} className="animate-in fade-in slide-in-from-bottom-2 duration-1000">
      <p className="text-sm font-medium text-cyan-300">{slide.title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{slide.subtitle}</p>
    </div>
  );
}
