"use client";

import Link from "next/link";
import { Home, Search, Briefcase, Settings, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadarLogo } from "@/components/radar-logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <RadarLogo />
        </div>

        {/* Illustration */}
        <div className="relative mb-8">
          <div className="relative inline-flex">
            {/* Radar circles */}
            <div className="w-48 h-48 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center relative overflow-hidden">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                  <span className="text-6xl font-bold text-slate-300 dark:text-slate-700">
                    404
                  </span>
                </div>
              </div>
              {/* Radar sweep */}
              <div
                className="absolute top-1/2 left-1/2 w-24 h-24 origin-left animate-spin-slow"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15))",
                  borderRadius: "0 100% 100% 0 / 50% 50% 50% 50%",
                  transformOrigin: "0% 50%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          The page may have been moved, deleted, or never existed. Let&apos;s
          get you back on track.
        </p>

        {/* Primary CTA */}
        <Link href="/dashboard">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px] mb-6"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" className="min-h-[44px]">
              <Briefcase className="h-4 w-4 mr-2" />
              Jobs
            </Button>
          </Link>
          <Link href="/dashboard/search">
            <Button variant="outline" className="min-h-[44px]">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="outline" className="min-h-[44px]">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
