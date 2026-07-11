
// src/store/job-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RemoteType = "worldwide" | "regional" | "hybrid" | "onsite";
export type SeniorityLevel = "entry" | "mid" | "senior" | "lead";
export type SortOption = "relevance" | "date" | "company" | "title";

interface KeywordFilter {
  value: string;
  type: "must" | "should" | "not";
}

interface LocationFilter {
  remoteTypes: RemoteType[];
  countries: string[];
  cities: string[];
  timezones: string[];
}

interface SalaryFilter {
  min: number;
  max: number;
  currency: "USD" | "EUR" | "GBP";
}

interface JobFilters {
  keywords: KeywordFilter[];
  location: LocationFilter;
  seniority: SeniorityLevel[];
  yearsExperience: [number, number];
  companies: string[];
  excludeCompanies: string[];
  industries: string[];
  salary: SalaryFilter;
  skills: { value: string; type: "must" | "should" | "not" }[];
}

interface JobState {
  filters: JobFilters;
  searchQuery: string;
  sortBy: SortOption;
  currentPage: number;
  itemsPerPage: number;
  sidebarOpen: boolean;
  filterSidebarOpen: boolean;

  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setSidebarOpen: (open: boolean) => void;
  setFilterSidebarOpen: (open: boolean) => void;

  addKeyword: (keyword: string, type: "must" | "should" | "not") => void;
  removeKeyword: (keyword: string) => void;
  clearKeywords: () => void;

  toggleRemoteType: (type: RemoteType) => void;
  setCountries: (countries: string[]) => void;
  setCities: (cities: string[]) => void;
  setTimezones: (timezones: string[]) => void;

  toggleSeniority: (level: SeniorityLevel) => void;
  setYearsExperience: (range: [number, number]) => void;

  addCompany: (company: string) => void;
  removeCompany: (company: string) => void;
  addExcludeCompany: (company: string) => void;
  removeExcludeCompany: (company: string) => void;

  setIndustries: (industries: string[]) => void;

  setSalary: (salary: Partial<SalaryFilter>) => void;

  addSkill: (skill: string, type: "must" | "should" | "not") => void;
  removeSkill: (skill: string) => void;

  clearAllFilters: () => void;
  getActiveFilterCount: () => number;
}

const defaultFilters: JobFilters = {
  keywords: [],
  location: {
    remoteTypes: [],
    countries: [],
    cities: [],
    timezones: [],
  },
  seniority: [],
  yearsExperience: [0, 15],
  companies: [],
  excludeCompanies: [],
  industries: [],
  salary: {
    min: 0,
    max: 500000,
    currency: "USD",
  },
  skills: [],
};

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,
      searchQuery: "",
      sortBy: "relevance",
      currentPage: 1,
      itemsPerPage: 10,
      sidebarOpen: true,
      filterSidebarOpen: false,

      setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setItemsPerPage: (items) => set({ itemsPerPage: items, currentPage: 1 }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setFilterSidebarOpen: (open) => set({ filterSidebarOpen: open }),

      addKeyword: (keyword, type) =>
        set((state) => {
          if (state.filters.keywords.length >= 20) return state;
          if (state.filters.keywords.some((k) => k.value === keyword))
            return state;
          return {
            filters: {
              ...state.filters,
              keywords: [...state.filters.keywords, { value: keyword, type }],
            },
          };
        }),

      removeKeyword: (keyword) =>
        set((state) => ({
          filters: {
            ...state.filters,
            keywords: state.filters.keywords.filter(
              (k) => k.value !== keyword
            ),
          },
        })),

      clearKeywords: () =>
        set((state) => ({
          filters: { ...state.filters, keywords: [] },
        })),

      toggleRemoteType: (type) =>
        set((state) => ({
          filters: {
            ...state.filters,
            location: {
              ...state.filters.location,
              remoteTypes: state.filters.location.remoteTypes.includes(type)
                ? state.filters.location.remoteTypes.filter((t) => t !== type)
                : [...state.filters.location.remoteTypes, type],
            },
          },
        })),

      setCountries: (countries) =>
        set((state) => ({
          filters: {
            ...state.filters,
            location: { ...state.filters.location, countries },
          },
        })),

      setCities: (cities) =>
        set((state) => ({
          filters: {
            ...state.filters,
            location: { ...state.filters.location, cities },
          },
        })),

      setTimezones: (timezones) =>
        set((state) => ({
          filters: {
            ...state.filters,
            location: { ...state.filters.location, timezones },
          },
        })),

      toggleSeniority: (level) =>
        set((state) => ({
          filters: {
            ...state.filters,
            seniority: state.filters.seniority.includes(level)
              ? state.filters.seniority.filter((l) => l !== level)
              : [...state.filters.seniority, level],
          },
        })),

      setYearsExperience: (range) =>
        set((state) => ({
          filters: { ...state.filters, yearsExperience: range },
        })),

      addCompany: (company) =>
        set((state) => ({
          filters: {
            ...state.filters,
            companies: state.filters.companies.includes(company)
              ? state.filters.companies
              : [...state.filters.companies, company],
          },
        })),

      removeCompany: (company) =>
        set((state) => ({
          filters: {
            ...state.filters,
            companies: state.filters.companies.filter((c) => c !== company),
          },
        })),

      addExcludeCompany: (company) =>
        set((state) => ({
          filters: {
            ...state.filters,
            excludeCompanies: state.filters.excludeCompanies.includes(company)
              ? state.filters.excludeCompanies
              : [...state.filters.excludeCompanies, company],
          },
        })),

      removeExcludeCompany: (company) =>
        set((state) => ({
          filters: {
            ...state.filters,
            excludeCompanies: state.filters.excludeCompanies.filter(
              (c) => c !== company
            ),
          },
        })),

      setIndustries: (industries) =>
        set((state) => ({
          filters: { ...state.filters, industries },
        })),

      setSalary: (salary) =>
        set((state) => ({
          filters: {
            ...state.filters,
            salary: { ...state.filters.salary, ...salary },
          },
        })),

      addSkill: (skill, type) =>
        set((state) => {
          if (state.filters.skills.some((s) => s.value === skill))
            return state;
          return {
            filters: {
              ...state.filters,
              skills: [...state.filters.skills, { value: skill, type }],
            },
          };
        }),

      removeSkill: (skill) =>
        set((state) => ({
          filters: {
            ...state.filters,
            skills: state.filters.skills.filter((s) => s.value !== skill),
          },
        })),

      clearAllFilters: () => set({ filters: defaultFilters, currentPage: 1 }),

      getActiveFilterCount: () => {
        const state = get();
        let count = 0;
        count += state.filters.keywords.length;
        count += state.filters.location.remoteTypes.length;
        count += state.filters.location.countries.length;
        count += state.filters.location.cities.length;
        count += state.filters.location.timezones.length;
        count += state.filters.seniority.length;
        if (
          state.filters.yearsExperience[0] > 0 ||
          state.filters.yearsExperience[1] < 15
        )
          count += 1;
        count += state.filters.companies.length;
        count += state.filters.excludeCompanies.length;
        count += state.filters.industries.length;
        if (state.filters.salary.min > 0 || state.filters.salary.max < 500000)
          count += 1;
        count += state.filters.skills.length;
        return count;
      },
    }),
    {
      name: "jobradar-filters",
      partialize: (state) => ({
        filters: state.filters,
        sortBy: state.sortBy,
        itemsPerPage: state.itemsPerPage,
      }),
    }
  )
);
