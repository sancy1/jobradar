"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { JobCard } from "@/components/dashboard/job-card";
import { Pagination } from "@/components/dashboard/pagination";
import { mockJobs, Job } from "@/lib/mock-data";
import { useJobStore } from "@/store/job-store";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import { Search, Briefcase, SearchX } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const router = useRouter();
  const { searchQuery, sortBy, currentPage, itemsPerPage, setFilterSidebarOpen } =
    useJobStore();
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(
    new Set(mockJobs.filter((j) => j.saved).map((j) => j.id))
  );
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Simulate initial loading
  useMemo(() => {
    setTimeout(() => setIsInitialLoading(false), 500);
  }, []);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case "relevance":
        result.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      case "date":
        result.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());
        break;
      case "company":
        result.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    // Update saved status
    result = result.map((job) => ({
      ...job,
      saved: savedJobs.has(job.id),
    }));

    return result;
  }, [jobs, searchQuery, sortBy, savedJobs]);

  // Paginate
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, currentPage, itemsPerPage]);

  const handleViewDetails = (job: Job) => {
    router.push(`/jobs/${job.id}`);
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
        toast.success("Job removed from saved");
      } else {
        next.add(jobId);
        toast.success("Job saved!");
      }
      return next;
    });
  };

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setShowApplyDialog(true);
  };

  const handleConfirmApply = () => {
    toast.success(`Application submitted for ${selectedJob?.title}!`);
    setShowApplyDialog(false);
    setSelectedJob(null);
  };

  const skeletons = Array.from({ length: itemsPerPage }, (_, i) => (
    <div
      key={i}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
    >
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Job Matches
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            We found {filteredJobs.length} jobs matching your profile and
            preferences
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar onOpenFilters={() => setFilterSidebarOpen(true)} />

        {/* Job List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {isInitialLoading ? (
            skeletons
          ) : paginatedJobs.length > 0 ? (
            paginatedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={handleViewDetails}
                onToggleSave={handleToggleSave}
                onApply={handleApply}
              />
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState
                icon={SearchX}
                title="No jobs found"
                message="We couldn't find any jobs matching your current filters. Try adjusting your search criteria or clearing some filters."
                actionLabel="Clear all filters"
                onAction={() => {
                  useJobStore.getState().clearAllFilters();
                  useJobStore.getState().setSearchQuery("");
                }}
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <Pagination totalItems={filteredJobs.length} />
        )}
      </div>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Position</DialogTitle>
            <DialogDescription>
              {selectedJob && (
                <span>
                  You are about to apply for{" "}
                  <strong>{selectedJob.title}</strong> at{" "}
                  <strong>{selectedJob.company}</strong>.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This is a placeholder for the application form. In the production
              version, you would be able to customize your application, attach a
              resume, and write a cover letter.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleConfirmApply}
            >
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
