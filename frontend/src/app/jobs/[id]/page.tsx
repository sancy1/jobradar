"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Building2,
  ExternalLink,
  Heart,
  Share2,
  Flag,
  Linkedin,
  Globe,
  CheckCircle2,
  Copy,
  Users,
  Briefcase,
  DollarSign,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { Job, mockJobs } from "@/lib/mock-data";
import { RemoteType } from "@/store/job-store";
import {
  getSimilarJobs,
  generateJobSlug,
  getCompanyInfo,
  jobDescriptions,
} from "@/lib/job-utils";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/dashboard/layout";
import { JobCard } from "@/components/dashboard/job-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const remoteTypeConfig: Record<
  RemoteType,
  { label: string; color: string; bgColor: string }
> = {
  worldwide: {
    label: "Worldwide Remote",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  regional: {
    label: "Regional Remote",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  hybrid: {
    label: "Hybrid",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  onsite: {
    label: "Onsite",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-900/30",
  },
};

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  return date.toLocaleDateString();
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

const getRelevanceColor = (score: number): string => {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [saved, setSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the job
    const foundJob = mockJobs.find((j) => j.id === jobId);
    if (foundJob) {
      setJob(foundJob);
      setSaved(foundJob.saved);
      setSimilarJobs(getSimilarJobs(foundJob, 4));
    }
    setLoading(false);
  }, [jobId]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleSave = () => {
    setSaved(!saved);
    toast.success(saved ? "Job removed from saved" : "Job saved!");
  };

  const handleApply = () => {
    setShowApplyModal(true);
  };

  const handleNotifyMe = () => {
    toast.success("We'll notify you when applications open!");
    setShowApplyModal(false);
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-16 text-center">
          <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Briefcase className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Job Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This job may have been removed or is no longer available.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const companyInfo = getCompanyInfo(job.company);
  const jobDetails = jobDescriptions.default;
  const remoteConfig = remoteTypeConfig[job.remoteType];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to results
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              {/* Company Logo and Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-8 w-8 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="font-medium">{job.company}</span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={cn(remoteConfig.bgColor, remoteConfig.color)}>
                  {remoteConfig.label}
                </Badge>
                <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {getRelativeTime(job.postedAt)}
                </Badge>
                {job.salary && (
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-900">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                  </Badge>
                )}
              </div>

              {/* Relevance Score */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Match Score
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        job.relevanceScore >= 70
                          ? "text-green-600 dark:text-green-400"
                          : job.relevanceScore >= 40
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-dark-400"
                      )}
                    >
                      {job.relevanceScore}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        getRelevanceColor(job.relevanceScore)
                      )}
                      style={{ width: `${job.relevanceScore}%` }}
                    />
                  </div>
                </div>
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    getRelevanceColor(job.relevanceScore)
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-6">
                <Button
                  size="lg"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleApply}
                >
                  Apply Now
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleSave}
                        className={cn(
                          saved && "text-red-500 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/40"
                        )}
                      >
                        <Heart
                          className={cn("h-5 w-5", saved && "fill-current")}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{saved ? "Remove from saved" : "Save job"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleReport}
                  className="text-slate-500"
                >
                  <Flag className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                About This Role
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {jobDetails.description}
              </p>

              {/* Responsibilities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Responsibilities
                </h3>
                <ul className="space-y-2">
                  {jobDetails.responsibilities.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {jobDetails.requirements.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Benefits
                </h3>
                <ul className="space-y-2">
                  {jobDetails.benefits.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Technologies & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Company
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {job.company}
                  </p>
                  <p className="text-sm text-slate-500">{companyInfo.industry}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4" />
                  <span>{companyInfo.size} employees</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Briefcase className="h-4 w-4" />
                  <span>{companyInfo.industry}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {companyInfo.description}
              </p>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a href={companyInfo.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a href={companyInfo.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Similar Jobs
                </h3>
                <div className="space-y-3">
                  {similarJobs.map((similarJob) => (
                    <Link
                      key={similarJob.id}
                      href={`/jobs/${similarJob.id}`}
                      className="block p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                            {similarJob.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {similarJob.company}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                remoteTypeConfig[similarJob.remoteType].bgColor,
                                remoteTypeConfig[similarJob.remoteType].color
                              )}
                            >
                              {remoteTypeConfig[similarJob.remoteType].label}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply to {job.title}</DialogTitle>
            <DialogDescription>
              at {job.company}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 flex items-center justify-center mb-4">
                <Sparkles className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Application Feature Coming Soon!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                We&apos;re working hard to bring you the best application experience.
                Be the first to know when applications open for this position.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowApplyModal(false)} className="w-full sm:w-auto">
              Close
            </Button>
            <Button
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
              onClick={handleNotifyMe}
            >
              Notify Me When Ready
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Job Posting</DialogTitle>
            <DialogDescription>
              Help us keep JobRadar safe and accurate
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {[
                "This is a scam or fraudulent posting",
                "The job description is misleading",
                "Company information is incorrect",
                "This posting has expired",
                "Other",
              ].map((reason) => (
                <Button
                  key={reason}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    toast.success("Thank you for your report!");
                    setShowReportModal(false);
                  }}
                >
                  {reason}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
