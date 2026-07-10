"use client";

import { useState, useRef } from "react";
import {
  Link2,
  Play,
  Trash2,
  Copy,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  Globe,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Tag,
  MapPin,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";

type ProcessStatus = "idle" | "processing" | "completed" | "failed";
type RemoteType = "worldwide" | "regional" | "hybrid" | "onsite";
type SeniorityLevel = "entry" | "mid" | "senior" | "any";

interface URLResult {
  url: string;
  status: "success" | "failed";
  message?: string;
  jobId?: string;
}

interface BatchConfig {
  keywordsMust: string[];
  keywordsShould: string[];
  keywordsNot: string[];
  remoteType: RemoteType;
  seniority: SeniorityLevel;
}

const remoteOptions: { value: RemoteType; label: string }[] = [
  { value: "worldwide", label: "Worldwide Remote" },
  { value: "regional", label: "Regional Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

const seniorityOptions: { value: SeniorityLevel; label: string }[] = [
  { value: "any", label: "Any Level" },
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
];

const exampleURLs = `https://stripe.com/jobs/listing/senior-engineer/12345
https://linear.app/careers/backend-engineer
https://vercel.com/careers/frontend-developer`;

export function URLBatchIngestion() {
  const { user } = useAuth();
  const [urlInput, setUrlInput] = useState("");
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<URLResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [batchId, setBatchId] = useState<string | null>(null);

  // Configuration state
  const [keywordsMust, setKeywordsMust] = useState<string[]>([]);
  const [keywordsShould, setKeywordsShould] = useState<string[]>([]);
  const [keywordsNot, setKeywordsNot] = useState<string[]>([]);
  const [remoteType, setRemoteType] = useState<RemoteType>("worldwide");
  const [seniority, setSeniority] = useState<SeniorityLevel>("any");

  // Input states
  const [keywordMustInput, setKeywordMustInput] = useState("");
  const [keywordShouldInput, setKeywordShouldInput] = useState("");
  const [keywordNotInput, setKeywordNotInput] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse URLs from input
  const parsedURLs = urlInput
    .split("\n")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  // Validate URL format
  const isValidURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Add keyword tag
  const addKeyword = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    max: number = 20
  ) => {
    const trimmed = value.trim().toLowerCase();
    if (trimmed && !list.includes(trimmed) && list.length < max) {
      setList([...list, trimmed]);
      return true;
    }
    return false;
  };

  // Remove keyword tag
  const removeKeyword = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter((k) => k !== value));
  };

  // Process URLs
  const handleProcess = async () => {
    if (!supabase || !user) {
      toast.error("You must be logged in to process URLs");
      return;
    }

    if (parsedURLs.length === 0) {
      toast.error("Please enter at least one URL");
      return;
    }

    const invalidURLs = parsedURLs.filter((url) => !isValidURL(url));
    if (invalidURLs.length > 0) {
      toast.error(`${invalidURLs.length} invalid URL(s) found. Please check the format.`);
      return;
    }

    setStatus("processing");
    setProgress(0);
    setResults([]);
    setShowResults(true);
    setShowConfig(false);

    const config: BatchConfig = {
      keywordsMust,
      keywordsShould,
      keywordsNot,
      remoteType,
      seniority,
    };

    try {
      // Create batch record
      const { data: batch, error: batchError } = await supabase
        .from("url_batches")
        .insert({
          user_id: user.id,
          status: "processing",
          urls: parsedURLs.map((url) => ({ url })),
          total_urls: parsedURLs.length,
          config: config,
        })
        .select()
        .single();

      if (batchError) throw batchError;
      setBatchId(batch.id);

      // Simulate processing (in production, this would call an edge function)
      const processingResults: URLResult[] = [];
      for (let i = 0; i < parsedURLs.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const url = parsedURLs[i];
        const isSuccess = Math.random() > 0.3; // Simulate 70% success rate

        const result: URLResult = {
          url,
          status: isSuccess ? "success" : "failed",
          message: isSuccess
            ? "Job extracted successfully"
            : "Could not extract job data",
          jobId: isSuccess ? crypto.randomUUID() : undefined,
        };

        processingResults.push(result);
        setResults([...processingResults]);
        setProgress(((i + 1) / parsedURLs.length) * 100);
      }

      // Update batch with results
      await supabase
        .from("url_batches")
        .update({
          status: "completed",
          successful: processingResults.filter((r) => r.status === "success").length,
          failed: processingResults.filter((r) => r.status === "failed").length,
          results: processingResults,
        })
        .eq("id", batch.id);

      setStatus("completed");
      const successCount = processingResults.filter((r) => r.status === "success").length;
      toast.success(`Processed ${parsedURLs.length} URLs. ${successCount} successful.`);
    } catch (error) {
      console.error("Error processing URLs:", error);
      setStatus("failed");
      toast.error("Failed to process URLs");
    }
  };

  // Clear all
  const handleClear = () => {
    setUrlInput("");
    setKeywordsMust([]);
    setKeywordsShould([]);
    setKeywordsNot([]);
    setRemoteType("worldwide");
    setSeniority("any");
    setResults([]);
    setStatus("idle");
    setProgress(0);
    setShowResults(false);
    setShowConfig(true);
    setBatchId(null);
  };

  // Copy results to clipboard
  const handleCopyResults = () => {
    const text = results
      .map((r) => `${r.status === "success" ? "✓" : "✗"} ${r.url}${r.message ? ` - ${r.message}` : ""}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Results copied to clipboard");
  };

  // Export results
  const handleExport = () => {
    const csv = [
      "URL,Status,Message",
      ...results.map((r) => `"${r.url}",${r.status},"${r.message || ""}"`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported");
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const failedCount = results.filter((r) => r.status === "failed").length;

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Link2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>Manual URL Processing</CardTitle>
            <CardDescription>Process job URLs in batch with custom filters</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Job URLs (one per line)</Label>
            <Badge variant="secondary">{parsedURLs.length} URLs</Badge>
          </div>
          <Textarea
            ref={textareaRef}
            placeholder={exampleURLs}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            rows={5}
            className="font-mono text-sm"
            disabled={status === "processing"}
          />
          <p className="text-xs text-slate-500">
            Enter job posting URLs, one per line. Supports direct job links and career page URLs.
          </p>
        </div>

        {/* Configuration */}
        {status === "idle" && (
          <Collapsible open={showConfig} onOpenChange={setShowConfig}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Filter Configuration
                </span>
                {showConfig ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Must Have
                  </Label>
                  <Input
                    placeholder="Add keyword..."
                    value={keywordMustInput}
                    onChange={(e) => setKeywordMustInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (addKeyword(keywordMustInput, keywordsMust, setKeywordsMust)) {
                          setKeywordMustInput("");
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1 min-h-[32px]">
                    {keywordsMust.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="cursor-pointer text-xs"
                        onClick={() => removeKeyword(kw, keywordsMust, setKeywordsMust)}
                      >
                        {kw} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                    Should Have
                  </Label>
                  <Input
                    placeholder="Add keyword..."
                    value={keywordShouldInput}
                    onChange={(e) => setKeywordShouldInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (addKeyword(keywordShouldInput, keywordsShould, setKeywordsShould)) {
                          setKeywordShouldInput("");
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1 min-h-[32px]">
                    {keywordsShould.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="cursor-pointer text-xs"
                        onClick={() => removeKeyword(kw, keywordsShould, setKeywordsShould)}
                      >
                        {kw} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-500" />
                    Must Not Have
                  </Label>
                  <Input
                    placeholder="Add keyword..."
                    value={keywordNotInput}
                    onChange={(e) => setKeywordNotInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (addKeyword(keywordNotInput, keywordsNot, setKeywordsNot)) {
                          setKeywordNotInput("");
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1 min-h-[32px]">
                    {keywordsNot.map((kw) => (
                      <Badge
                        key={kw}
                        variant="destructive"
                        className="cursor-pointer text-xs"
                        onClick={() => removeKeyword(kw, keywordsNot, setKeywordsNot)}
                      >
                        {kw} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location & Seniority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Preference
                  </Label>
                  <Select value={remoteType} onValueChange={(v) => setRemoteType(v as RemoteType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {remoteOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Seniority
                  </Label>
                  <Select value={seniority} onValueChange={(v) => setSeniority(v as SeniorityLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {seniorityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Progress Bar (when processing) */}
        {status === "processing" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing URLs...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {results.length} of {parsedURLs.length} URLs processed
            </p>
          </div>
        )}

        {/* Results Summary */}
        {showResults && results.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-2xl font-bold">{parsedURLs.length}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
                <p className="text-xs text-green-600">Successful</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                <p className="text-xs text-red-600">Failed</p>
              </div>
            </div>

            {/* Results List */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span>View Details</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="max-h-48 overflow-y-auto space-y-1 mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-start gap-2 text-sm p-2 rounded",
                        result.status === "success"
                          ? "bg-green-50/50 dark:bg-green-900/10"
                          : "bg-red-50/50 dark:bg-red-900/10"
                      )}
                    >
                      {result.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="flex-1 truncate font-mono text-xs">{result.url}</span>
                      <span
                        className={cn(
                          "text-xs",
                          result.status === "success" ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {result.status === "success" ? "Success" : result.message || "Failed"}
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Export Actions */}
            {status === "completed" && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyResults}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {status === "idle" || status === "completed" || status === "failed" ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClear}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleProcess}
                disabled={parsedURLs.length === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Process URLs
              </Button>
            </>
          ) : (
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </Button>
          )}
        </div>

        {/* Completed Actions */}
        {status === "completed" && successCount > 0 && (
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Globe className="h-4 w-4 mr-2" />
            View {successCount} Jobs in Dashboard
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
