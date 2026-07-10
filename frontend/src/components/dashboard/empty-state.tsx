"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="inline-flex p-5 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-5">
        <Icon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>

      {/* Message */}
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {message}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && actionHref && (
          <Link href={actionHref}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px]">
              {actionLabel}
            </Button>
          </Link>
        )}
        {actionLabel && onAction && !actionHref && (
          <Button
            onClick={onAction}
            className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px]"
          >
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && secondaryActionHref && (
          <Link href={secondaryActionHref}>
            <Button variant="outline" className="min-h-[44px]">
              {secondaryActionLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
