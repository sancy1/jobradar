export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  keywordsMust: string[];
  keywordsShould: string[];
  keywordsNot: string[];
  remoteTypes: string[];
  countries: string[];
  cities: string[];
  timezones: string[];
  seniority: string[];
  yearsMin: number;
  yearsMax: number;
  companies: string[];
  excludeCompanies: string[];
  industries: string[];
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: "USD" | "EUR" | "GBP";
  skillsMust: string[];
  skillsShould: string[];
  skillsNot: string[];
  lastRunAt?: Date;
  runCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const defaultSavedSearch: Omit<SavedSearch, "id" | "createdAt" | "updatedAt" | "runCount"> = {
  name: "",
  description: "",
  keywordsMust: [],
  keywordsShould: [],
  keywordsNot: [],
  remoteTypes: [],
  countries: [],
  cities: [],
  timezones: [],
  seniority: [],
  yearsMin: 0,
  yearsMax: 15,
  companies: [],
  excludeCompanies: [],
  industries: [],
  salaryMin: 0,
  salaryMax: 500000,
  salaryCurrency: "USD",
  skillsMust: [],
  skillsShould: [],
  skillsNot: [],
  isActive: true,
};

export const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Sweden",
  "Norway",
  "Denmark",
  "Ireland",
  "Spain",
  "Portugal",
  "Italy",
  "Australia",
  "New Zealand",
  "Singapore",
  "Japan",
  "South Korea",
  "India",
  "United Arab Emirates",
  "Israel",
  "Brazil",
  "Mexico",
];

export const timezones = [
  { value: "UTC-12:00", label: "UTC-12:00 (Baker Island)" },
  { value: "UTC-11:00", label: "UTC-11:00 (American Samoa)" },
  { value: "UTC-10:00", label: "UTC-10:00 (Hawaii)" },
  { value: "UTC-09:00", label: "UTC-09:00 (Alaska)" },
  { value: "UTC-08:00", label: "UTC-08:00 (Pacific Time)" },
  { value: "UTC-07:00", label: "UTC-07:00 (Mountain Time)" },
  { value: "UTC-06:00", label: "UTC-06:00 (Central Time)" },
  { value: "UTC-05:00", label: "UTC-05:00 (Eastern Time)" },
  { value: "UTC-04:00", label: "UTC-04:00 (Atlantic)" },
  { value: "UTC-03:00", label: "UTC-03:00 (Brazil, Argentina)" },
  { value: "UTC-02:00", label: "UTC-02:00 (Mid-Atlantic)" },
  { value: "UTC-01:00", label: "UTC-01:00 (Azores)" },
  { value: "UTC+00:00", label: "UTC+00:00 (GMT, London)" },
  { value: "UTC+01:00", label: "UTC+01:00 (Central Europe)" },
  { value: "UTC+02:00", label: "UTC+02:00 (Eastern Europe)" },
  { value: "UTC+03:00", label: "UTC+03:00 (Moscow, Istanbul)" },
  { value: "UTC+04:00", label: "UTC+04:00 (Dubai)" },
  { value: "UTC+05:00", label: "UTC+05:00 (Pakistan)" },
  { value: "UTC+05:30", label: "UTC+05:30 (India)" },
  { value: "UTC+06:00", label: "UTC+06:00 (Bangladesh)" },
  { value: "UTC+07:00", label: "UTC+07:00 (Bangkok, Jakarta)" },
  { value: "UTC+08:00", label: "UTC+08:00 (Singapore, Hong Kong)" },
  { value: "UTC+09:00", label: "UTC+09:00 (Tokyo, Seoul)" },
  { value: "UTC+10:00", label: "UTC+10:00 (Sydney, Melbourne)" },
  { value: "UTC+11:00", label: "UTC+11:00 (Solomon Islands)" },
  { value: "UTC+12:00", label: "UTC+12:00 (Auckland, Fiji)" },
];

export const industries = [
  "Technology",
  "Software Development",
  "FinTech",
  "Healthcare & Biotech",
  "E-commerce",
  "SaaS",
  "Education & EdTech",
  "Media & Entertainment",
  "Gaming",
  "Manufacturing",
  "Real Estate",
  "Transportation & Logistics",
  "Energy & CleanTech",
  "Consulting",
  "Financial Services",
  "Insurance",
  "Legal",
  "Marketing & Advertising",
  "Non-Profit",
  "Government",
];

export const remoteTypeOptions = [
  { value: "worldwide", label: "Worldwide Remote", description: "Work from anywhere in the world" },
  { value: "regional", label: "Regional Remote", description: "Work remotely within a region/timezone" },
  { value: "hybrid", label: "Hybrid", description: "Mix of remote and on-site work" },
  { value: "onsite", label: "Onsite", description: "Work from office" },
];

export const seniorityOptions = [
  { value: "entry", label: "Entry Level", description: "0-2 years experience" },
  { value: "mid", label: "Mid Level", description: "2-5 years experience" },
  { value: "senior", label: "Senior Level", description: "5-8 years experience" },
  { value: "lead", label: "Lead/Principal", description: "8+ years experience" },
];

export const currencies = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
];
