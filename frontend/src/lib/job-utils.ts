import { Job, mockJobs } from "@/lib/mock-data";

export function getJobById(id: string): Job | undefined {
  return mockJobs.find((job) => job.id === id);
}

export function getSimilarJobs(job: Job, limit: number = 4): Job[] {
  return mockJobs
    .filter((j) => j.id !== job.id)
    .sort((a, b) => {
      const aScore =calculateSimilarity(job, a);
      const bScore = calculateSimilarity(job, b);
      return bScore - aScore;
    })
    .slice(0, limit);
}

function calculateSimilarity(job1: Job, job2: Job): number {
  let score = 0;

  // Same company
  if (job1.company === job2.company) score += 30;

  // Same remote type
  if (job1.remoteType === job2.remoteType) score += 20;

  // Same seniority
  if (job1.seniority === job2.seniority) score += 15;

  // Overlapping tags
  const commonTags = job1.tags.filter((tag) => job2.tags.includes(tag));
  score += commonTags.length * 5;

  return score;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateJobSlug(job: Job): string {
  return `${slugify(job.title)}-at-${slugify(job.company)}`;
}

export const companies = {
  Stripe: {
    industry: "FinTech",
    size: "5,000+",
    website: "https://stripe.com",
    linkedin: "https://linkedin.com/company/stripe",
    description: "Stripe is a technology company that builds economic infrastructure for the internet.",
  },
  Figma: {
    industry: "Design",
    size: "1,000+",
    website: "https://figma.com",
    linkedin: "https://linkedin.com/company/figma",
    description: "Figma is a collaborative interface design tool.",
  },
  Notion: {
    industry: "Productivity",
    size: "500+",
    website: "https://notion.so",
    linkedin: "https://linkedin.com/company/notion",
    description: "Notion is an all-in-one workspace for notes, docs, wikis, and project management.",
  },
  Linear: {
    industry: "Productivity",
    size: "100+",
    website: "https://linear.app",
    linkedin: "https://linkedin.com/company/linear",
    description: "Linear is a modern issue tracking tool built for speed.",
  },
  Vercel: {
    industry: "Developer Tools",
    size: "500+",
    website: "https://vercel.com",
    linkedin: "https://linkedin.com/company/vercel",
    description: "Vercel provides developer tools powering the fastest websites and apps.",
  },
  Shopify: {
    industry: "E-commerce",
    size: "10,000+",
    website: "https://shopify.com",
    linkedin: "https://linkedin.com/company/shopify",
    description: "Shopify is an e-commerce platform for online stores and retail point-of-sale systems.",
  },
  Datadog: {
    industry: "DevOps",
    size: "3,000+",
    website: "https://datadoghq.com",
    linkedin: "https://linkedin.com/company/datadog",
    description: "Datadog provides monitoring and analytics platform for cloud-scale applications.",
  },
  Deel: {
    industry: "HR Tech",
    size: "500+",
    website: "https://deel.com",
    linkedin: "https://linkedin.com/company/deel",
    description: "Deel helps companies hire anyone, anywhere, easily.",
  },
  GitLab: {
    industry: "Developer Tools",
    size: "2,000+",
    website: "https://gitlab.com",
    linkedin: "https://linkedin.com/company/gitlab-com",
    description: "GitLab is a complete DevOps platform.",
  },
  HashiCorp: {
    industry: "Infrastructure",
    size: "1,000+",
    website: "https://hashicorp.com",
    linkedin: "https://linkedin.com/company/hashicorp",
    description: "HashiCorp builds infrastructure software for cloud environments.",
  },
  Spotify: {
    industry: "Music Streaming",
    size: "8,000+",
    website: "https://spotify.com",
    linkedin: "https://linkedin.com/company/spotify",
    description: "Spotify is a digital music service that provides access to millions of songs.",
  },
  Framer: {
    industry: "Design",
    size: "100+",
    website: "https://framer.com",
    linkedin: "https://linkedin.com/company/framer",
    description: "Framer is a design tool for creating interactive prototypes and websites.",
  },
  Snowflake: {
    industry: "Data Warehousing",
    size: "3,000+",
    website: "https://snowflake.com",
    linkedin: "https://linkedin.com/company/snowflake-computing",
    description: "Snowflake provides a data warehouse service for cloud computing.",
  },
  Webflow: {
    industry: "Web Development",
    size: "500+",
    website: "https://webflow.com",
    linkedin: "https://linkedin.com/company/webflow",
    description: "Webflow is a visual web development platform for building professional websites.",
  },
  Databricks: {
    industry: "Data & AI",
    size: "3,000+",
    website: "https://databricks.com",
    linkedin: "https://linkedin.com/company/databricks",
    description: "Databricks provides a unified analytics platform for big data and AI.",
  },
  Adyen: {
    industry: "Payments",
    size: "2,000+",
    website: "https://adyen.com",
    linkedin: "https://linkedin.com/company/adyen",
    description: "Adyen is a global payment company offering end-to-end payment solutions.",
  },
  Coda: {
    industry: "Productivity",
    size: "200+",
    website: "https://coda.io",
    linkedin: "https://linkedin.com/company/coda-app",
    description: "Coda is a collaborative document that combines words, data, and teams.",
  },
  Cloudflare: {
    industry: "Infrastructure",
    size: "2,000+",
    website: "https://cloudflare.com",
    linkedin: "https://linkedin.com/company/cloudflare",
    description: "Cloudflare provides web performance and security services.",
  },
  Loom: {
    industry: "Video",
    size: "200+",
    website: "https://loom.com",
    linkedin: "https://linkedin.com/company/loom-video",
    description: "Loom is a video messaging tool for async communication.",
  },
  Monzo: {
    industry: "Banking",
    size: "1,000+",
    website: "https://monzo.com",
    linkedin: "https://linkedin.com/company/monzo-bank",
    description: "Monzo is a digital bank focused on making money work for everyone.",
  },
  Miro: {
    industry: "Collaboration",
    size: "1,000+",
    website: "https://miro.com",
    linkedin: "https://linkedin.com/company/miroapp",
    description: "Miro is an online collaborative whiteboard platform.",
  },
  Canonical: {
    industry: "Open Source",
    size: "500+",
    website: "https://canonical.com",
    linkedin: "https://linkedin.com/company/canonical-ltd",
    description: "Canonical is the company behind Ubuntu.",
  },
  MongoDB: {
    industry: "Database",
    size: "4,000+",
    website: "https://mongodb.com",
    linkedin: "https://linkedin.com/company/mongodb",
    description: "MongoDB is a general-purpose, document-based, distributed database.",
  },
  Anthropic: {
    industry: "AI Research",
    size: "200+",
    website: "https://anthropic.com",
    linkedin: "https://linkedin.com/company/anthropicresearch",
    description: "Anthropic is an AI safety company building reliable and interpretable AI systems.",
  },
};

export function getCompanyInfo(companyName: string) {
  return companies[companyName as keyof typeof companies] || {
    industry: "Technology",
    size: "N/A",
    website: "#",
    linkedin: "#",
    description: `${companyName} is a technology company.`,
  };
}

export const jobDescriptions: Record<string, { description: string; responsibilities: string[]; requirements: string[]; benefits: string[] }> = {
  default: {
    description: "We are looking for a talented engineer to join our team and help build the future of technology. This is an exciting opportunity to work on challenging problems and make a real impact.",
    responsibilities: [
      "Design and implement scalable software solutions",
      "Collaborate with cross-functional teams to deliver products",
      "Write clean, maintainable, and well-tested code",
      "Participate in code reviews and provide constructive feedback",
      "Mentor junior engineers and contribute to team growth",
    ],
    requirements: [
      "Strong proficiency in modern programming languages",
      "Experience with distributed systems and cloud platforms",
      "Excellent problem-solving and communication skills",
      "Ability to work independently and in a team environment",
      "Passion for learning and staying current with new technologies",
    ],
    benefits: [
      "Competitive salary and equity package",
      "Remote-first work culture",
      "Health, dental, and vision insurance",
      "Unlimited PTO policy",
      "Learning and development budget",
      "Home office setup stipend",
    ],
  },
};
