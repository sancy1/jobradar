"use client";

import { useState } from "react";
import { Heart, MapPin, Clock, Building2, ExternalLink, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Job } from "@/lib/mock-data";
import { RemoteType } from "@/store/job-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface JobCardProps {
  job: Job;
  onViewDetails?: (job: Job) => void;
  onToggleSave?: (jobId: string) => void;
  onApply?: (job: Job) => void;
}

const remoteTypeConfig: Record<
  RemoteType,
  { label: string; color: string; bgColor: string; darkBgColor: string }
> = {
  worldwide: {
    label: "Worldwide Remote",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    darkBgColor: "dark:bg-green-900/30",
  },
  regional: {
    label: "Regional Remote",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    darkBgColor: "dark:bg-amber-900/30",
  },
  hybrid: {
    label: "Hybrid",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    darkBgColor: "dark:bg-purple-900/30",
  },
  onsite: {
    label: "Onsite",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    darkBgColor: "dark:bg-red-900/30",
  },
};

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  return date.toLocaleDateString();
};

const getRelevanceColor = (score: number): string => {
  if (score >= 85) return "bg-green-500";
  if (score >= 70) return "bg-amber-500";
  return "bg-red-500";
};

const formatSalary = (
  min: number,
  max: number,
  currency: string
): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
};

export function JobCard({
  job,
  onViewDetails,
  onToggleSave,
  onApply,
}: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const remoteConfig = remoteTypeConfig[job.remoteType];

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-slate-200 dark:border-slate-800",
        "bg-white dark:bg-slate-900 p-5 transition-all duration-300 cursor-pointer",
        isHovered && "shadow-lg -translate-y-0.5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(job)}
    >
      <div className="flex gap-4">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-6 w-6 text-slate-400" />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Company */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {job.company}
                </span>
              </div>
            </div>

            {/* Save Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-9 w-9 flex-shrink-0 transition-colors",
                      job.saved &&
                        "text-red-500 hover:text-red-600"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave?.(job.id);
                    }}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5",
                        job.saved && "fill-current"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{job.saved ? "Remove from saved" : "Save job"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Location and Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge
              variant="secondary"
              className={cn(
                remoteConfig.bgColor,
                remoteConfig.color,
                "font-medium"
              )}
            >
              {remoteConfig.label}
            </Badge>

            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.location}</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{getRelativeTime(job.postedAt)}</span>
            </div>

            {job.salary && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Briefcase className="h-3.5 w-3.5" />
                <span>
                  {formatSalary(
                    job.salary.min,
                    job.salary.max,
                    job.salary.currency
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.tags.slice(0, 5).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                {tag}
              </Badge>
            ))}
            {job.tags.length > 5 && (
              <Badge
                variant="outline"
                className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
              >
                +{job.tags.length - 5}
              </Badge>
            )}
          </div>

          {/* Bottom Row - Relevance and Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Relevance Score */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Match
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      job.relevanceScore >= 85
                        ? "text-green-600 dark:text-green-400"
                        : job.relevanceScore >= 70
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {job.relevanceScore}%
                  </span>
                </div>
                <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", getRelevanceColor(job.relevanceScore))}
                    style={{ width: `${job.relevanceScore}%` }}
                  />
                </div>
              </div>
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  getRelevanceColor(job.relevanceScore)
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(job);
                }}
              >
                View Details
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply?.(job);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
