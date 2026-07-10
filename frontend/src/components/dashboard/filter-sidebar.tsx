"use client";

import { useState } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
  Building2,
  DollarSign,
  Code,
  Tag,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobStore, RemoteType, SeniorityLevel } from "@/store/job-store";
import { industries, techSkills } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

interface FilterSidebarProps {
  open: boolean;
  onClose: () => void;
}

const remoteTypes: { value: RemoteType; label: string }[] = [
  { value: "worldwide", label: "Worldwide Remote" },
  { value: "regional", label: "Regional Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

const seniorityLevels: { value: SeniorityLevel; label: string }[] = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "lead", label: "Lead/Principal" },
];

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Netherlands",
  "Australia",
  "Singapore",
  "Japan",
  "India",
];

const timezones = [
  "UTC-8 (Pacific)",
  "UTC-5 (Eastern)",
  "UTC+0 (GMT)",
  "UTC+1 (Central EU)",
  "UTC+8 (Singapore)",
  "UTC+9 (Tokyo)",
];

const currencies = [
  { value: "USD", label: "USD $" },
  { value: "EUR", label: "EUR €" },
  { value: "GBP", label: "GBP £" },
];

export function FilterSidebar({ open, onClose }: FilterSidebarProps) {
  const {
    filters,
    addKeyword,
    removeKeyword,
    toggleRemoteType,
    toggleSeniority,
    setYearsExperience,
    setSalary,
    addSkill,
    removeSkill,
    addCompany,
    removeCompany,
    addExcludeCompany,
    removeExcludeCompany,
    setIndustries,
    setCountries,
    setTimezones,
    clearAllFilters,
    getActiveFilterCount,
  } = useJobStore();

  const [keywordInput, setKeywordInput] = useState("");
  const [keywordType, setKeywordType] = useState<"must" | "should" | "not">(
    "must"
  );
  const [companyInput, setCompanyInput] = useState("");
  const [excludeCompanyInput, setExcludeCompanyInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skillType, setSkillType] = useState<"must" | "should" | "not">("must");

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      addKeyword(keywordInput.trim(), keywordType);
      setKeywordInput("");
    }
  };

  const handleAddCompany = () => {
    if (companyInput.trim()) {
      addCompany(companyInput.trim());
      setCompanyInput("");
    }
  };

  const handleAddExcludeCompany = () => {
    if (excludeCompanyInput.trim()) {
      addExcludeCompany(excludeCompanyInput.trim());
      setExcludeCompanyInput("");
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      addSkill(skillInput.trim(), skillType);
      setSkillInput("");
    }
  };

  const activeFilters = getActiveFilterCount();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed right-0 top-0 h-full z-50 bg-white dark:bg-slate-900 shadow-xl transition-all duration-300 ease-in-out overflow-hidden",
          "w-80 border-l border-slate-200 dark:border-slate-800",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Filters
            </h2>
            {activeFilters > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilters}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Clear all
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Filter Sections */}
        <div className="h-[calc(100vh-65px)] overflow-y-auto">
          <Accordion type="multiple" defaultValue={["keywords", "location", "seniority"]} className="w-full">
            {/* Keywords Section */}
            <AccordionItem value="keywords">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Keywords</span>
                  {filters.keywords.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.keywords.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add keyword..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                    />
                    <Select value={keywordType} onValueChange={(v) => setKeywordType(v as "must" | "should" | "not")}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="must">Must</SelectItem>
                        <SelectItem value="should">Should</SelectItem>
                        <SelectItem value="not">Not</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {filters.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {filters.keywords.map((kw) => (
                        <Badge
                          key={kw.value}
                          variant={
                            kw.type === "must"
                              ? "default"
                              : kw.type === "should"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs cursor-pointer"
                          onClick={() => removeKeyword(kw.value)}
                        >
                          //{kw.type === "must" && "+"}
                          //{kw.type === "not" && "-"}
                          {kw.value}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    Max 20 keywords. Must = AND, Should = OR, Not = NOT
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Location Section */}
            <AccordionItem value="location">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Location</span>
                  {filters.location.remoteTypes.length +
                    filters.location.countries.length >
                    0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.location.remoteTypes.length +
                        filters.location.countries.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                      Remote Type
                    </Label>
                    <div className="space-y-2">
                      {remoteTypes.map((rt) => (
                        <div
                          key={rt.value}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`remote-${rt.value}`}
                            checked={filters.location.remoteTypes.includes(
                              rt.value
                            )}
                            onCheckedChange={() => toggleRemoteType(rt.value)}
                          />
                          <Label
                            htmlFor={`remote-${rt.value}`}
                            className="text-sm cursor-pointer"
                          >
                            {rt.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                      Country
                    </Label>
                    <Select
                      value={filters.location.countries[0] || ""}
                      onValueChange={(v) =>
                        v && setCountries([v])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                      City
                    </Label>
                    <Input placeholder="Search city..." />
                  </div>

                  <div>
                    <Label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                      Timezone
                    </Label>
                    <Select
                      value={filters.location.timezones[0] || ""}
                      onValueChange={(v) =>
                        v && setTimezones([v])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Seniority Section */}
            <AccordionItem value="seniority">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Seniority</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    {seniorityLevels.map((sl) => (
                      <div key={sl.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`seniority-${sl.value}`}
                          checked={filters.seniority.includes(sl.value)}
                          onCheckedChange={() => toggleSeniority(sl.value)}
                        />
                        <Label
                          htmlFor={`seniority-${sl.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {sl.label}
                        </Label>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm text-slate-600 dark:text-slate-400 mb-3 block">
                      Years of Experience: {filters.yearsExperience[0]} -{" "}
                      {filters.yearsExperience[1]}+
                    </Label>
                    <Slider
                      value={filters.yearsExperience}
                      onValueChange={(v) =>
                        setYearsExperience(v as [number, number])
                      }
                      min={0}
                      max={15}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Company Section */}
            <AccordionItem value="company">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Company</span>
                  {filters.companies.length + filters.excludeCompanies.length >
                    0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.companies.length +
                        filters.excludeCompanies.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                      Target Companies
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={companyInput}
                        onChange={(e) => setCompanyInput(e.target.value)}
                        placeholder="Add company..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleAddCompany()}
                      />
                    </div>
                    {filters.companies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {filters.companies.map((c) => (
                          <Badge
                            key={c}
                            variant="secondary"
                            className="text-xs cursor-pointer"
                            onClick={() => removeCompany(c)}
                          >
                            {c}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                      Exclude Companies
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={excludeCompanyInput}
                        onChange={(e) => setExcludeCompanyInput(e.target.value)}
                        placeholder="Exclude company..."
                        className="flex-1"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddExcludeCompany()
                        }
                      />
                    </div>
                    {filters.excludeCompanies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {filters.excludeCompanies.map((c) => (
                          <Badge
                            key={c}
                            variant="destructive"
                            className="text-xs cursor-pointer"
                            onClick={() => removeExcludeCompany(c)}
                          >
                            {c}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Industry Section */}
            <AccordionItem value="industry">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Industry</span>
                  {filters.industries.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.industries.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {industries.map((industry) => (
                    <div key={industry} className="flex items-center gap-2">
                      <Checkbox
                        id={`industry-${industry}`}
                        checked={filters.industries.includes(industry)}
                        onCheckedChange={(checked) =>
                          setIndustries(
                            checked
                              ? [...filters.industries, industry]
                              : filters.industries.filter((i) => i !== industry)
                          )
                        }
                      />
                      <Label
                        htmlFor={`industry-${industry}`}
                        className="text-sm cursor-pointer"
                      >
                        {industry}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Salary Section */}
            <AccordionItem value="salary">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Salary</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <Select
                    value={filters.salary.currency}
                    onValueChange={(v) =>
                      setSalary({ currency: v as "USD" | "EUR" | "GBP" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <Label className="text-sm text-slate-600 dark:text-slate-400 mb-3 block">
                      Range: ${filters.salary.min.toLocaleString()} - $
                      {filters.salary.max.toLocaleString()}
                    </Label>
                    <Slider
                      value={[filters.salary.min, filters.salary.max]}
                      onValueChange={(v) =>
                        setSalary({ min: v[0], max: v[1] })
                      }
                      min={0}
                      max={500000}
                      step={10000}
                      className="w-full"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Skills Section */}
            <AccordionItem value="skills">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Skills</span>
                  {filters.skills.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.skills.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Select value={skillInput} onValueChange={setSkillInput}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select skill..." />
                      </SelectTrigger>
                      <SelectContent>
                        {techSkills.map((skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={skillType} onValueChange={(v) => setSkillType(v as "must" | "should" | "not")}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="must">Must</SelectItem>
                        <SelectItem value="should">Should</SelectItem>
                        <SelectItem value="not">Not</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleAddSkill}
                    disabled={!skillInput}
                  >
                    Add Skill
                  </Button>
                  {filters.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {filters.skills.map((s) => (
                        <Badge
                          key={s.value}
                          variant={
                            s.type === "must"
                              ? "default"
                              : s.type === "should"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs cursor-pointer"
                          onClick={() => removeSkill(s.value)}
                        >
                          {s.value}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Apply Button */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              Apply Filters
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
