"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { EmptyState } from "@/components/dashboard/empty-state";
import { JobCard } from "@/components/dashboard/job-card";
import { mockJobs, Job } from "@/lib/mock-data";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSavedJobs(mockJobs.filter((j) => j.saved));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleSave = (jobId: string) => {
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-1">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Saved Jobs
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Jobs you&apos;ve bookmarked for later
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onToggleSave={handleToggleSave}
                onViewDetails={(j) =>
                  (window.location.href = `/jobs/${j.id}`)
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No saved jobs yet"
            message="Start saving jobs you're interested in by clicking the heart icon on any job card."
            actionLabel="Browse Jobs"
            actionHref="/dashboard"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
