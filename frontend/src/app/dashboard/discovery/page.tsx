"use client";

import { DashboardLayout } from "@/components/dashboard/layout";
import { CrawlController } from "@/components/dashboard/crawl-controller";
import { URLBatchIngestion } from "@/components/dashboard/url-batch-ingestion";

export default function DiscoveryPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Job Discovery
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Automatically discover and process job listings, or manually ingest URLs
          </p>
        </div>

        {/* Two-column layout for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crawl Controller */}
          <CrawlController />

          {/* URL Batch Ingestion */}
          <URLBatchIngestion />
        </div>

        {/* Getting Started Guide */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Job Discovery Engine</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Automatically crawl job boards and company career pages to find relevant positions.
              </p>
              <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Select your search sources</li>
                <li>• Choose limited or unlimited mode</li>
                <li>• Watch real-time progress and activity</li>
                <li>• Save or discard results at any time</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Manual URL Processing</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Paste job URLs directly for instant processing with your custom filters.
              </p>
              <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Paste multiple URLs at once</li>
                <li>• Apply must-have / should-have / exclude keywords</li>
                <li>• Set location and seniority preferences</li>
                <li>• Export results to CSV</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
