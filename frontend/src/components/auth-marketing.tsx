"use client";

import { Radar, Search, Compass, FileText, TrendingUp, Globe } from "lucide-react";
import { RadarLogo } from "@/components/radar-logo";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description: "AI-powered matching with advanced filters for remote type, seniority, and salary",
  },
  {
    icon: Compass,
    title: "Web Discovery",
    description: "Crawl and aggregate job listings from multiple sources automatically",
  },
  {
    icon: TrendingUp,
    title: "Match Scoring",
    description: "See relevance scores for every job before you waste time applying",
  },
  {
    icon: FileText,
    title: "Application Tracking",
    description: "Track every application from saved to submitted to hired",
  },
];

export function AuthMarketing() {
  return (
    <div className="relative z-10 flex flex-col justify-center h-full px-8 lg:px-16 xl:px-20 -mt-8">
      {/* Logo */}
      <div className="mb-20">
        <RadarLogo size="lg" />
      </div>

      {/* Headline */}
      <div className="max-w-lg">
        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
          Find your dream job with{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            radar precision
          </span>
        </h1>
        <p className="mt-4 text-base lg:text-lg text-slate-300 leading-relaxed">
          JobRadar scans the web, scores every listing against your profile, and
          surfaces the opportunities that actually matter — all in one beautiful
          dashboard.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="flex items-start gap-3 group"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center transition-colors group-hover:bg-white/20">
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Bar */}
      <div className="mt-12 flex items-center gap-8 max-w-lg">
        <div>
          <div className="text-2xl font-bold text-white">10K+</div>
          <div className="text-xs text-slate-400">Jobs indexed</div>
        </div>
        <div className="h-8 w-px bg-white/15" />
        <div>
          <div className="text-2xl font-bold text-white">500+</div>
          <div className="text-xs text-slate-400">Companies</div>
        </div>
        <div className="h-8 w-px bg-white/15" />
        <div>
          <div className="text-2xl font-bold text-white">95%</div>
          <div className="text-xs text-slate-400">Match accuracy</div>
        </div>
      </div>
    </div>
  );
}
