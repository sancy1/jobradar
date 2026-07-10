"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save,
  Play,
  Search,
  Clock,
  MapPin,
  Briefcase,
  Building2,
  DollarSign,
  Code,
  Tag,
  Globe,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Trash2,
  Edit,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { SavedSearch, defaultSavedSearch, countries, timezones, industries, remoteTypeOptions, seniorityOptions, currencies } from "@/lib/search-config";
import { techSkills } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

const searchSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface SearchProfile extends SavedSearch {
  id: string;
}

export default function SearchConfigPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("new");
  const [savedSearches, setSavedSearches] = useState<SearchProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchToDelete, setSearchToDelete] = useState<string | null>(null);
  const [editingSearch, setEditingSearch] = useState<SearchProfile | null>(null);

  // Form state for new search
  const [keywordsMust, setKeywordsMust] = useState<string[]>([]);
  const [keywordsShould, setKeywordsShould] = useState<string[]>([]);
  const [keywordsNot, setKeywordsNot] = useState<string[]>([]);
  const [remoteTypes, setRemoteTypes] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>([]);
  const [selectedSeniority, setSelectedSeniority] = useState<string[]>([]);
  const [yearsRange, setYearsRange] = useState<[number, number]>([0, 15]);
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [excludedCompanies, setExcludedCompanies] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 500000]);
  const [salaryCurrency, setSalaryCurrency] = useState<"USD" | "EUR" | "GBP">("USD");
  const [skillsMust, setSkillsMust] = useState<string[]>([]);
  const [skillsShould, setSkillsShould] = useState<string[]>([]);
  const [skillsNot, setSkillsNot] = useState<string[]>([]);

  // Input states
  const [keywordMustInput, setKeywordMustInput] = useState("");
  const [keywordShouldInput, setKeywordShouldInput] = useState("");
  const [keywordNotInput, setKeywordNotInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [excludeCompanyInput, setExcludeCompanyInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Load saved searches
  const loadSavedSearches = useCallback(async () => {
    if (!supabase || !user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted: SearchProfile[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        keywordsMust: item.keywords_must || [],
        keywordsShould: item.keywords_should || [],
        keywordsNot: item.keywords_not || [],
        remoteTypes: item.remote_types || [],
        countries: item.countries || [],
        cities: item.cities || [],
        timezones: item.timezones || [],
        seniority: item.seniority || [],
        yearsMin: item.years_min || 0,
        yearsMax: item.years_max || 15,
        companies: item.companies || [],
        excludeCompanies: item.exclude_companies || [],
        industries: item.industries || [],
        salaryMin: item.salary_min || 0,
        salaryMax: item.salary_max || 500000,
        salaryCurrency: item.salary_currency || "USD",
        skillsMust: item.skills_must || [],
        skillsShould: item.skills_should || [],
        skillsNot: item.skills_not || [],
        lastRunAt: item.last_run_at ? new Date(item.last_run_at) : undefined,
        runCount: item.run_count || 0,
        isActive: item.is_active ?? true,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      setSavedSearches(formatted);
    } catch (error) {
      console.error("Error loading saved searches:", error);
      toast.error("Failed to load saved searches");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSavedSearches();
  }, [loadSavedSearches]);

  // Reset form to default
  const resetForm = () => {
    reset({ name: "", description: "" });
    setKeywordsMust([]);
    setKeywordsShould([]);
    setKeywordsNot([]);
    setRemoteTypes([]);
    setSelectedCountries([]);
    setSelectedTimezones([]);
    setSelectedSeniority([]);
    setYearsRange([0, 15]);
    setTargetCompanies([]);
    setExcludedCompanies([]);
    setSelectedIndustries([]);
    setSalaryRange([0, 500000]);
    setSalaryCurrency("USD");
    setSkillsMust([]);
    setSkillsShould([]);
    setSkillsNot([]);
    setEditingSearch(null);
  };

  // Load search for editing
  const handleEdit = (search: SearchProfile) => {
    reset({ name: search.name, description: search.description || "" });
    setKeywordsMust(search.keywordsMust);
    setKeywordsShould(search.keywordsShould);
    setKeywordsNot(search.keywordsNot);
    setRemoteTypes(search.remoteTypes);
    setSelectedCountries(search.countries);
    setSelectedTimezones(search.timezones);
    setSelectedSeniority(search.seniority);
    setYearsRange([search.yearsMin, search.yearsMax]);
    setTargetCompanies(search.companies);
    setExcludedCompanies(search.excludeCompanies);
    setSelectedIndustries(search.industries);
    setSalaryRange([search.salaryMin, search.salaryMax]);
    setSalaryCurrency(search.salaryCurrency);
    setSkillsMust(search.skillsMust);
    setSkillsShould(search.skillsShould);
    setSkillsNot(search.skillsNot);
    setEditingSearch(search);
    setActiveTab("new");
  };

  // Save search profile
  const handleSave = async (data: SearchFormData, runSearch: boolean = false) => {
    if (!supabase || !user) {
      toast.error("You must be logged in to save searches");
      return;
    }

    setIsLoading(true);
    try {
      const searchData = {
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        keywords_must: keywordsMust,
        keywords_should: keywordsShould,
        keywords_not: keywordsNot,
        remote_types: remoteTypes,
        countries: selectedCountries,
        cities: [],
        timezones: selectedTimezones,
        seniority: selectedSeniority,
        years_min: yearsRange[0],
        years_max: yearsRange[1],
        companies: targetCompanies,
        exclude_companies: excludedCompanies,
        industries: selectedIndustries,
        salary_min: salaryRange[0],
        salary_max: salaryRange[1],
        salary_currency: salaryCurrency,
        skills_must: skillsMust,
        skills_should: skillsShould,
        skills_not: skillsNot,
        last_run_at: runSearch ? new Date().toISOString() : null,
        run_count: runSearch ? 1 : 0,
        is_active: true,
      };

      if (editingSearch) {
        const { error } = await supabase
          .from("saved_searches")
          .update(searchData)
          .eq("id", editingSearch.id);

        if (error) throw error;
        toast.success("Search profile updated!");
      } else {
        const { error } = await supabase
          .from("saved_searches")
          .insert(searchData);

        if (error) throw error;
        toast.success("Search profile saved!");
      }

      await loadSavedSearches();
      resetForm();

      if (runSearch) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error saving search:", error);
      toast.error("Failed to save search profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Run search
  const handleRunSearch = async (search: SearchProfile) => {
    if (!supabase) return;

    try {
      await supabase
        .from("saved_searches")
        .update({
          last_run_at: new Date().toISOString(),
          run_count: search.runCount + 1,
        })
        .eq("id", search.id);

      toast.success("Running search...");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error running search:", error);
      toast.error("Failed to run search");
    }
  };

  // Delete search
  const handleDelete = async () => {
    if (!supabase || !searchToDelete) return;

    try {
      await supabase.from("saved_searches").delete().eq("id", searchToDelete);
      toast.success("Search profile deleted");
      await loadSavedSearches();
    } catch (error) {
      console.error("Error deleting search:", error);
      toast.error("Failed to delete search");
    } finally {
      setDeleteDialogOpen(false);
      setSearchToDelete(null);
    }
  };

  // Tag input handlers
  const addTag = (
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

  const removeTag = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter((t) => t !== value));
  };

  // Get summary for display
  const getSearchSummary = (search: SearchProfile) => {
    const parts: string[] = [];
    if (search.keywordsMust.length > 0) parts.push(search.keywordsMust.slice(0, 3).join(", "));
    if (search.remoteTypes.length > 0) parts.push(search.remoteTypes[0]);
    if (search.seniority.length > 0) parts.push(search.seniority[0]);
    return parts.length > 0 ? parts.join(" • ") : "No filters set";
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Search Configuration
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create and manage your job search profiles
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="new" className="gap-2">
              <Plus className="h-4 w-4" />
              {editingSearch ? "Edit Search" : "New Search"}
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Save className="h-4 w-4" />
              Saved Searches
              {savedSearches.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {savedSearches.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* New Search Tab */}
          <TabsContent value="new" className="space-y-6">
            <form onSubmit={handleSubmit((data) => handleSave(data, false))}>
              {/* Basic Settings */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">Basic Settings</CardTitle>
                  <CardDescription>
                    Give your search profile a name and optional description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Search Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Senior React Developer - Remote"
                      {...register("name")}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what you're looking for..."
                      {...register("description")}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Keywords Section */}
              <Card className="border-slate-200 dark:border-slate-800 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Keywords
                  </CardTitle>
                  <CardDescription>
                    Define keywords that must, should, or must not appear in job listings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Must Have */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Must Have (AND)</Badge>
                      <span className="text-sm text-slate-500">({keywordsMust.length}/20)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type and press Enter..."
                        value={keywordMustInput}
                        onChange={(e) => setKeywordMustInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (addTag(keywordMustInput, keywordsMust, setKeywordsMust)) {
                              setKeywordMustInput("");
                            }
                          }
                        }}
                      />
                    </div>
                    {keywordsMust.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {keywordsMust.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                            onClick={() => removeTag(tag, keywordsMust, setKeywordsMust)}
                          >
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Should Have */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Should Have (OR)</Badge>
                      <span className="text-sm text-slate-500">({keywordsShould.length}/20)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type and press Enter..."
                        value={keywordShouldInput}
                        onChange={(e) => setKeywordShouldInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (addTag(keywordShouldInput, keywordsShould, setKeywordsShould)) {
                              setKeywordShouldInput("");
                            }
                          }
                        }}
                      />
                    </div>
                    {keywordsShould.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {keywordsShould.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                            onClick={() => removeTag(tag, keywordsShould, setKeywordsShould)}
                          >
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Must Not Have */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Must Not Have (NOT)</Badge>
                      <span className="text-sm text-slate-500">({keywordsNot.length}/20)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type and press Enter..."
                        value={keywordNotInput}
                        onChange={(e) => setKeywordNotInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (addTag(keywordNotInput, keywordsNot, setKeywordsNot)) {
                              setKeywordNotInput("");
                            }
                          }
                        }}
                      />
                    </div>
                    {keywordsNot.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {keywordsNot.map((tag) => (
                          <Badge
                            key={tag}
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => removeTag(tag, keywordsNot, setKeywordsNot)}
                          >
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location Section */}
              <Card className="border-slate-200 dark:border-slate-800 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Remote Types */}
                  <div className="space-y-3">
                    <Label>Remote Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {remoteTypeOptions.map((option) => (
                        <div
                          key={option.value}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all",
                            remoteTypes.includes(option.value)
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                          )}
                          onClick={() => {
                            if (remoteTypes.includes(option.value)) {
                              setRemoteTypes(remoteTypes.filter((t) => t !== option.value));
                            } else {
                              setRemoteTypes([...remoteTypes, option.value]);
                            }
                          }}
                        >
                          <p className="font-medium text-sm">{option.label}</p>
                          <p className="text-xs text-slate-500">{option.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Countries */}
                  <div className="space-y-2">
                    <Label>Countries ({selectedCountries.length} selected)</Label>
                    <Select
                      value=""
                      onValueChange={(v) => {
                        if (v && !selectedCountries.includes(v)) {
                          setSelectedCountries([...selectedCountries, v]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add country..." />
                      </SelectTrigger>
                      <SelectContent>
                        {countries
                          .filter((c) => !selectedCountries.includes(c))
                          .map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {selectedCountries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCountries.map((country) => (
                          <Badge
                            key={country}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() =>
                              setSelectedCountries(selectedCountries.filter((c) => c !== country))
                            }
                          >
                            {country}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timezones */}
                  <div className="space-y-2">
                    <Label>Timezones ({selectedTimezones.length} selected)</Label>
                    <Select
                      value=""
                      onValueChange={(v) => {
                        if (v && !selectedTimezones.includes(v)) {
                          setSelectedTimezones([...selectedTimezones, v]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add timezone..." />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones
                          .filter((tz) => !selectedTimezones.includes(tz.value))
                          .map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {selectedTimezones.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTimezones.map((tz) => (
                          <Badge
                            key={tz}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() =>
                              setSelectedTimezones(selectedTimezones.filter((t) => t !== tz))
                            }
                          >
                            {tz}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Seniority Section */}
              <Card className="border-slate-200 dark:border-slate-800 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Seniority
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Experience Level</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {seniorityOptions.map((option) => (
                        <div
                          key={option.value}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all",
                            selectedSeniority.includes(option.value)
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                          )}
                          onClick={() => {
                            if (selectedSeniority.includes(option.value)) {
                              setSelectedSeniority(selectedSeniority.filter((s) => s !== option.value));
                            } else {
                              setSelectedSeniority([...selectedSeniority, option.value]);
                            }
                          }}
                        >
                          <p className="font-medium text-sm">{option.label}</p>
                          <p className="text-xs text-slate-500">{option.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Years of Experience: {yearsRange[0]} - {yearsRange[1]}+</Label>
                    <Slider
                      value={yearsRange}
                      onValueChange={(v) => setYearsRange(v as [number, number])}
                      min={0}
                      max={15}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="advanced" className="border-slate-200 dark:border-slate-800 rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4" />
                      Advanced Settings
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-6 pb-4">
                    {/* Companies */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Target Companies
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add company..."
                          value={companyInput}
                          onChange={(e) => setCompanyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (addTag(companyInput, targetCompanies, setTargetCompanies)) {
                                setCompanyInput("");
                              }
                            }
                          }}
                        />
                      </div>
                      {targetCompanies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {targetCompanies.map((company) => (
                            <Badge
                              key={company}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeTag(company, targetCompanies, setTargetCompanies)}
                            >
                              {company}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Exclude Companies */}
                    <div className="space-y-4">
                      <Label>Exclude Companies</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Exclude company..."
                          value={excludeCompanyInput}
                          onChange={(e) => setExcludeCompanyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (addTag(excludeCompanyInput, excludedCompanies, setExcludedCompanies)) {
                                setExcludeCompanyInput("");
                              }
                            }
                          }}
                        />
                      </div>
                      {excludedCompanies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {excludedCompanies.map((company) => (
                            <Badge
                              key={company}
                              variant="destructive"
                              className="cursor-pointer"
                              onClick={() =>
                                removeTag(company, excludedCompanies, setExcludedCompanies)
                              }
                            >
                              {company}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Industries */}
                    <div className="space-y-2">
                      <Label>Industries ({selectedIndustries.length} selected)</Label>
                      <Select
                        value=""
                        onValueChange={(v) => {
                          if (v && !selectedIndustries.includes(v)) {
                            setSelectedIndustries([...selectedIndustries, v]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add industry..." />
                        </SelectTrigger>
                        <SelectContent>
                          {industries
                            .filter((i) => !selectedIndustries.includes(i))
                            .map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {selectedIndustries.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedIndustries.map((industry) => (
                            <Badge
                              key={industry}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() =>
                                setSelectedIndustries(selectedIndustries.filter((i) => i !== industry))
                              }
                            >
                              {industry}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Salary */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Salary Range
                      </Label>
                      <div className="flex items-center gap-4">
                        <Select
                          value={salaryCurrency}
                          onValueChange={(v) => setSalaryCurrency(v as "USD" | "EUR" | "GBP")}
                        >
                          <SelectTrigger className="w-24">
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
                        <div className="flex-1">
                          <p className="text-sm text-slate-600 mb-2">
                            {salaryCurrency === "USD" ? "$" : salaryCurrency === "EUR" ? "€" : "£"}
                            {salaryRange[0].toLocaleString()} - {salaryRange[1].toLocaleString()}
                          </p>
                          <Slider
                            value={salaryRange}
                            onValueChange={(v) => setSalaryRange(v as [number, number])}
                            min={0}
                            max={500000}
                            step={10000}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Skills
                      </Label>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Must Have Skills */}
                        <div className="space-y-2">
                          <Label className="text-xs text-green-600">Must Have</Label>
                          <Select
                            value=""
                            onValueChange={(v) => {
                              if (v && !skillsMust.includes(v)) {
                                setSkillsMust([...skillsMust, v]);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Add..." />
                            </SelectTrigger>
                            <SelectContent>
                              {techSkills
                                .filter(
                                  (s) =>
                                    !skillsMust.includes(s) &&
                                    !skillsShould.includes(s) &&
                                    !skillsNot.includes(s)
                                )
                                .map((skill) => (
                                  <SelectItem key={skill} value={skill}>
                                    {skill}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-wrap gap-1 min-h-[40px] p-2 border rounded-md">
                            {skillsMust.map((skill) => (
                              <Badge
                                key={skill}
                                className="bg-green-100 text-green-700 cursor-pointer"
                                onClick={() => removeTag(skill, skillsMust, setSkillsMust)}
                              >
                                {skill}
                                <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Should Have Skills */}
                        <div className="space-y-2">
                          <Label className="text-xs text-amber-600">Should Have</Label>
                          <Select
                            value=""
                            onValueChange={(v) => {
                              if (v && !skillsShould.includes(v)) {
                                setSkillsShould([...skillsShould, v]);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Add..." />
                            </SelectTrigger>
                            <SelectContent>
                              {techSkills
                                .filter(
                                  (s) =>
                                    !skillsMust.includes(s) &&
                                    !skillsShould.includes(s) &&
                                    !skillsNot.includes(s)
                                )
                                .map((skill) => (
                                  <SelectItem key={skill} value={skill}>
                                    {skill}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-wrap gap-1 min-h-[40px] p-2 border rounded-md">
                            {skillsShould.map((skill) => (
                              <Badge
                                key={skill}
                                className="bg-amber-100 text-amber-700 cursor-pointer"
                                onClick={() => removeTag(skill, skillsShould, setSkillsShould)}
                              >
                                {skill}
                                <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Must Not Have Skills */}
                        <div className="space-y-2">
                          <Label className="text-xs text-red-600">Must Not Have</Label>
                          <Select
                            value=""
                            onValueChange={(v) => {
                              if (v && !skillsNot.includes(v)) {
                                setSkillsNot([...skillsNot, v]);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Add..." />
                            </SelectTrigger>
                            <SelectContent>
                              {techSkills
                                .filter(
                                  (s) =>
                                    !skillsMust.includes(s) &&
                                    !skillsShould.includes(s) &&
                                    !skillsNot.includes(s)
                                )
                                .map((skill) => (
                                  <SelectItem key={skill} value={skill}>
                                    {skill}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-wrap gap-1 min-h-[40px] p-2 border rounded-md">
                            {skillsNot.map((skill) => (
                              <Badge
                                key={skill}
                                className="bg-red-100 text-red-700 cursor-pointer"
                                onClick={() => removeTag(skill, skillsNot, setSkillsNot)}
                              >
                                {skill}
                                <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Action Buttons */}
              <div className="flex justify-between gap-4 mt-6">
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isLoading}
                    onClick={handleSubmit((data) => handleSave(data, false))}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Profile
                  </Button>
                  <Button
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                    onClick={handleSubmit((data) => handleSave(data, true))}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Save & Run Search
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          {/* Saved Searches Tab */}
          <TabsContent value="saved">
            {isLoading && savedSearches.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : savedSearches.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Save className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No saved searches yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Create your first search profile to save time on future job searches.
                </p>
                <Button onClick={() => setActiveTab("new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Search Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedSearches.map((search) => (
                  <Card key={search.id} className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{search.name}</CardTitle>
                          {search.description && (
                            <CardDescription className="mt-1">
                              {search.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {search.runCount} runs
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {getSearchSummary(search)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>
                          Created: {search.createdAt.toLocaleDateString()}
                        </span>
                        {search.lastRunAt && (
                          <span>
                            Last run: {search.lastRunAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(search)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRunSearch(search)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Run
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40"
                            onClick={() => {
                              setSearchToDelete(search.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Search Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this search profile? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
