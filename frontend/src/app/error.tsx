"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-amber-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/10 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="inline-flex p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>

          {/* Message */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            An unexpected error occurred. Try again, or return to the dashboard.
          </p>

          {/* Error Code */}
          {error.digest && (
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Error code: {error.digest}
            </p>
          )}

          {/* Stack trace (dev only) */}
          {isDev && error.stack && (
            <details className="mb-6 text-left">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                Show stack trace
              </summary>
              <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-red-600 dark:text-red-400 overflow-x-auto max-h-40">
                {error.stack}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px]"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard")}
              className="min-h-[44px]"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
