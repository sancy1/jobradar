"use client";

import { FileText } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function ApplicationsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-1">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Applications
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track jobs you&apos;ve applied to
          </p>
        </div>

        <EmptyState
          icon={FileText}
          title="No applications yet"
          message="When you apply for jobs, they'll appear here so you can track their status."
          actionLabel="Browse Jobs"
          actionHref="/dashboard"
        />
      </div>
    </DashboardLayout>
  );
}
