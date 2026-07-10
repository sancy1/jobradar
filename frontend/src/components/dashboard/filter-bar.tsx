"use client";

import { Filter, X } from "lucide-react";
import { useJobStore, RemoteType, SortOption, SeniorityLevel } from "@/store/job-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  onOpenFilters: () => void;
}

const remoteTypeLabels: Record<RemoteType, string> = {
  worldwide: "Worldwide Remote",
  regional: "Regional Remote",
  hybrid: "Hybrid",
  onsite: "Onsite",
};

const seniorityLabels: Record<SeniorityLevel, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior Level",
  lead: "Lead/Principal",
};

const sortLabels: Record<SortOption, string> = {
  relevance: "Relevance",
  date: "Date Posted",
  company: "Company",
  title: "Title",
};

export function FilterBar({ onOpenFilters }: FilterBarProps) {
  const {
    filters,
    sortBy,
    setSortBy,
    toggleRemoteType,
    toggleSeniority,
    clearAllFilters,
    getActiveFilterCount,
  } = useJobStore();

  const activeFilters = getActiveFilterCount();

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between py-4 border-b border-slate-200 dark:border-slate-800">
      {/* Left: Quick Filters */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFilters}
          className="gap-2 min-h-[44px]"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {activeFilters}
            </Badge>
          )}
        </Button>

        {/* Quick Remote Type Filters */}
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar -mx-1 px-1">
          {(["worldwide", "regional", "hybrid", "onsite"] as RemoteType[]).map(
            (type) => (
              <Button
                key={type}
                variant={
                  filters.location.remoteTypes.includes(type)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => toggleRemoteType(type)}
                className="text-xs whitespace-nowrap min-h-[44px]"
              >
                {remoteTypeLabels[type]}
              </Button>
            )
          )}
        </div>

        {/* Quick Seniority Filters */}
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar -mx-1 px-1 w-full lg:w-auto">
          {(["entry", "mid", "senior", "lead"] as SeniorityLevel[]).map(
            (level) => (
              <Button
                key={level}
                variant={
                  filters.seniority.includes(level) ? "default" : "outline"
                }
                size="sm"
                onClick={() => toggleSeniority(level)}
                className="text-xs whitespace-nowrap min-h-[44px]"
              >
                {seniorityLabels[level]}
              </Button>
            )
          )}
        </div>

        {/* Clear Filters */}
        {activeFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-1 text-slate-500 hover:text-slate-700 min-h-[44px]"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Right: Sort */}
      <div className="flex items-center gap-2 w-full lg:w-auto">
        <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
          Sort by:
        </span>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full lg:w-40 min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">{sortLabels.relevance}</SelectItem>
            <SelectItem value="date">{sortLabels.date}</SelectItem>
            <SelectItem value="company">{sortLabels.company}</SelectItem>
            <SelectItem value="title">{sortLabels.title}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
