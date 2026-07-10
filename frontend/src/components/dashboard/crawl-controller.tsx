"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Square,
  Trash2,
  Save,
  Clock,
  Link2,
  CheckCircle2,
  XCircle,
  Search,
  Globe,
  Building2,
  Briefcase,
  Settings,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type CrawlStatus = "idle" | "running" | "completed" | "aborted";
type CrawlMode = "limited" | "unlimited";
type SourceType = "corporate" | "job_boards" | "ats" | "all";

interface ActivityLog {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: Date;
}

interface CrawlSession {
  id: string;
  status: CrawlStatus;
  mode: CrawlMode;
  maxUrls: number | null;
  sources: SourceType[];
  urlsDiscovered: number;
  urlsProcessed: number;
  jobsPassed: number;
  jobsDropped: number;
  startedAt: Date | null;
  completedAt: Date | null;
  durationSeconds: number;
}

const sourceOptions: { value: SourceType; label: string; description: string }[] = [
  { value: "corporate", label: "Corporate", description: "Company career pages" },
  { value: "job_boards", label: "Job Boards", description: "LinkedIn, Indeed, etc." },
  { value: "ats", label: "ATS", description: "Applicant tracking systems" },
  { value: "all", label: "All Sources", description: "Search all available sources" },
];

const mockActivityLogs: ActivityLog[] = [
  { id: "1", type: "info", message: "Initializing crawler...", timestamp: new Date() },
  { id: "2", type: "success", message: "Found 12 new URLs", timestamp: new Date() },
  { id: "3", type: "info", message: "Scanning: stripe.com/careers", timestamp: new Date() },
  { id: "4", type: "success", message: "PASSED: Senior Engineer role", timestamp: new Date() },
  { id: "5", type: "warning", message: "DROPPED: US Only requirement", timestamp: new Date() },
];

export function CrawlController() {
  const { user } = useAuth();
  const [status, setStatus] = useState<CrawlStatus>("idle");
  const [mode, setMode] = useState<CrawlMode>("limited");
  const [maxUrls, setMaxUrls] = useState<number>(100);
  const [sources, setSources] = useState<SourceType[]>(["all"]);
  const [showSettings, setShowSettings] = useState(true);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [urlsDiscovered, setUrlsDiscovered] = useState(0);
  const [urlsProcessed, setUrlsProcessed] = useState(0);
  const [jobsPassed, setJobsPassed] = useState(0);
  const [jobsDropped, setJobsDropped] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [abortDialogOpen, setAbortDialogOpen] = useState(false);
  const [abortAction, setAbortAction] = useState<"save" | "delete">("save");
  const [isLoading, setIsLoading] = useState(false);

  const activityFeedRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll activity feed
  useEffect(() => {
    if (activityFeedRef.current) {
      activityFeedRef.current.scrollTop = activityFeedRef.current.scrollHeight;
    }
  }, [activityLogs]);

  // Timer for elapsed time
  useEffect(() => {
    if (status === "running") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  // Simulate crawl activity (for demo purposes)
  const simulateCrawl = useCallback(() => {
    const generateLog = (): ActivityLog => {
      const logTypes: Array<{ type: ActivityLog["type"]; messages: string[] }> = [
        {
          type: "info",
          messages: [
            "Scanning: company-website.com/careers",
            "Fetching page content...",
            "Parsing job listings...",
            "Connecting to next source...",
          ],
        },
        {
          type: "success",
          messages: [
            `Found ${Math.floor(Math.random() * 20) + 1} new URLs`,
            "PASSED: Senior Software Engineer",
            "PASSED: Full Stack Developer",
            "PASSED: Backend Engineer",
            "Extracted job data successfully",
          ],
        },
        {
          type: "warning",
          messages: [
            "DROPPED: US Only requirement",
            "DROPPED: Senior level required",
            "DROPPED: Not matching keywords",
            "Skipped: Duplicate URL",
          ],
        },
        {
          type: "error",
          messages: [
            "Failed to parse page structure",
            "Connection timeout, retrying...",
            "Invalid response format",
          ],
        },
      ];

      const weights = [0.4, 0.35, 0.2, 0.05];
      let random = Math.random();
      let selectedIndex = 0;
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          selectedIndex = i;
          break;
        }
      }

      const logType = logTypes[selectedIndex];
      const message = logType.messages[Math.floor(Math.random() * logType.messages.length)];

      return {
        id: crypto.randomUUID(),
        type: logType.type,
        message,
        timestamp: new Date(),
      };
    };

    simulationRef.current = setInterval(() => {
      const log = generateLog();
      setActivityLogs((prev) => [...prev.slice(-100), log]);

      if (log.message.includes("Found") && log.message.includes("URLs")) {
        setUrlsDiscovered((prev) => prev + Math.floor(Math.random() * 20) + 1);
      }
      if (log.message.includes("Scanning")) {
        setUrlsProcessed((prev) => prev + 1);
      }
      if (log.type === "success" && log.message.includes("PASSED")) {
        setJobsPassed((prev) => prev + 1);
      }
      if (log.type === "warning" && log.message.includes("DROPPED")) {
        setJobsDropped((prev) => prev + 1);
      }

      // Check if we should stop
      if (mode === "limited" && urlsProcessed >= maxUrls) {
        handleComplete();
      }
    }, 1500);
  }, [mode, maxUrls, urlsProcessed]);

  // Start discovery
  const handleStart = async () => {
    if (!supabase || !user) {
      toast.error("You must be logged in to start discovery");
      return;
    }

    if (sources.length === 0) {
      toast.error("Please select at least one source");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("crawl_sessions")
        .insert({
          user_id: user.id,
          status: "running",
          mode,
          max_urls: mode === "limited" ? maxUrls : null,
          sources,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setStatus("running");
      setActivityLogs([
        {
          id: crypto.randomUUID(),
          type: "info",
          message: "Discovery session started",
          timestamp: new Date(),
        },
      ]);
      setUrlsDiscovered(0);
      setUrlsProcessed(0);
      setJobsPassed(0);
      setJobsDropped(0);
      setElapsedSeconds(0);
      setShowSettings(false);

      toast.success("Job discovery started!");

      // Start simulation
      simulateCrawl();
    } catch (error) {
      console.error("Error starting crawl:", error);
      toast.error("Failed to start discovery session");
    } finally {
      setIsLoading(false);
    }
  };

  // Complete discovery
  const handleComplete = async () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }

    if (supabase && sessionId) {
      try {
        await supabase
          .from("crawl_sessions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            duration_seconds: elapsedSeconds,
            urls_discovered: urlsDiscovered,
            urls_processed: urlsProcessed,
            jobs_passed: jobsPassed,
            jobs_dropped: jobsDropped,
          })
          .eq("id", sessionId);
      } catch (error) {
        console.error("Error updating session:", error);
      }
    }

    setStatus("completed");
    setActivityLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "success",
        message: "Discovery session completed",
        timestamp: new Date(),
      },
    ]);

    toast.success("Discovery completed!");
  };

  // Abort discovery
  const handleAbort = async (saveResults: boolean) => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }

    if (supabase && sessionId) {
      try {
        if (saveResults) {
          await supabase
            .from("crawl_sessions")
            .update({
              status: "aborted",
              completed_at: new Date().toISOString(),
              duration_seconds: elapsedSeconds,
              urls_discovered: urlsDiscovered,
              urls_processed: urlsProcessed,
              jobs_passed: jobsPassed,
              jobs_dropped: jobsDropped,
            })
            .eq("id", sessionId);
        } else {
          // Delete the session and its logs
          await supabase.from("crawl_activity_logs").delete().eq("session_id", sessionId);
          await supabase.from("crawl_sessions").delete().eq("id", sessionId);
        }
      } catch (error) {
        console.error("Error aborting session:", error);
      }
    }

    setStatus("aborted");
    setSessionId(null);

    if (saveResults) {
      toast.success("Discovery aborted. Results saved.");
    } else {
      toast.success("Discovery aborted. Session deleted.");
      resetState();
    }

    setAbortDialogOpen(false);
  };

  // Reset state
  const resetState = () => {
    setStatus("idle");
    setSessionId(null);
    setActivityLogs([]);
    setUrlsDiscovered(0);
    setUrlsProcessed(0);
    setJobsPassed(0);
    setJobsDropped(0);
    setElapsedSeconds(0);
    setShowSettings(true);
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get status badge color
  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "aborted":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  // Get log icon
  const getLogIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Search className="h-4 w-4 text-blue-500" />;
    }
  };

  // Calculate progress
  const progress = mode === "limited" && maxUrls > 0 ? (urlsProcessed / maxUrls) * 100 : 0;

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Job Discovery Engine</CardTitle>
              <CardDescription>Automatically discover and process job listings</CardDescription>
            </div>
          </div>
          <Badge className={cn("capitalize", getStatusColor())}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Status */}
        {(status === "running" || status === "completed") && sessionId && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="font-mono">{formatDuration(elapsedSeconds)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Session:</span>
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {sessionId.slice(0, 8)}
              </code>
            </div>
          </div>
        )}

        {/* Execution Settings (shown when idle) */}
        {status === "idle" && showSettings && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mode Selection */}
              <div className="space-y-2">
                <Label>Crawl Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as CrawlMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limited">Limited (Max URLs)</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max URLs */}
              {mode === "limited" && (
                <div className="space-y-2">
                  <Label>Max URLs</Label>
                  <Input
                    type="number"
                    value={maxUrls}
                    onChange={(e) => setMaxUrls(parseInt(e.target.value) || 100)}
                    min={1}
                    max={10000}
                  />
                </div>
              )}
            </div>

            {/* Search Sources */}
            <div className="space-y-2">
              <Label>Search Sources</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {sourceOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      sources.includes(option.value)
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                    onClick={() => {
                      if (option.value === "all") {
                        setSources(["all"]);
                      } else {
                        const filtered = sources.filter((s) => s !== "all");
                        if (sources.includes(option.value)) {
                          setSources(filtered.filter((s) => s !== option.value));
                        } else {
                          setSources([...filtered, option.value]);
                        }
                      }
                    }}
                  >
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Start Button */}
        {status === "idle" && (
          <Button
            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
            onClick={handleStart}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Play className="h-5 w-5 mr-2" />
            )}
            Start Discovery
          </Button>
        )}

        {/* Running Section */}
        {status === "running" && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>
                  {urlsProcessed} / {mode === "limited" ? maxUrls : "∞"}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Link2 className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-slate-500">Discovered</span>
                </div>
                <p className="text-2xl font-bold">{urlsDiscovered}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Globe className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-slate-500">Processed</span>
                </div>
                <p className="text-2xl font-bold">{urlsProcessed}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-slate-500">Passed</span>
                </div>
                <p className="text-2xl font-bold">{jobsPassed}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-slate-500">Dropped</span>
                </div>
                <p className="text-2xl font-bold">{jobsDropped}</p>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Live Activity
                </Label>
                <Badge variant="secondary">{activityLogs.length} events</Badge>
              </div>
              <ScrollArea className="h-48 rounded-lg border bg-slate-50 dark:bg-slate-900 p-2">
                <div ref={activityFeedRef} className="space-y-1">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 text-sm p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {getLogIcon(log.type)}
                      <span className="flex-1">{log.message}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-50"
                onClick={() => {
                  setAbortAction("save");
                  setAbortDialogOpen(true);
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Abort & Save
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => {
                  setAbortAction("delete");
                  setAbortDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Abort & Delete
              </Button>
            </div>
          </>
        )}

        {/* Summary Section (when completed) */}
        {status === "completed" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <p className="text-3xl font-bold text-green-600">{jobsPassed}</p>
                <p className="text-sm text-green-700 dark:text-green-400">Jobs Found</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-3xl font-bold">{urlsDiscovered}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">URLs Discovered</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-3xl font-bold">{urlsProcessed}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">URLs Processed</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-3xl font-bold">{formatDuration(elapsedSeconds)}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Duration</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                View Results
              </Button>
              <Button variant="outline" className="flex-1" onClick={resetState}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start New Search
              </Button>
            </div>
          </div>
        )}

        {/* Aborted Section */}
        {status === "aborted" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <p className="font-semibold text-amber-800 dark:text-amber-200">Session Aborted</p>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                The discovery session was stopped before completion. {jobsPassed} jobs were found during the session.
              </p>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                View Saved Results
              </Button>
              <Button variant="outline" className="flex-1" onClick={resetState}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start New Search
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Abort Confirmation Dialog */}
      <AlertDialog open={abortDialogOpen} onOpenChange={setAbortDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {abortAction === "save" ? "Abort & Save Results?" : "Abort & Delete Session?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {abortAction === "save"
                ? `The session will be stopped and ${jobsPassed} jobs found will be saved to your results. You can view them later.`
                : "The session will be stopped and all data will be permanently deleted. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={abortAction === "delete" ? "bg-red-600 hover:bg-red-700" : ""}
              onClick={() => handleAbort(abortAction === "save")}
            >
              {abortAction === "save" ? "Abort & Save" : "Abort & Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
