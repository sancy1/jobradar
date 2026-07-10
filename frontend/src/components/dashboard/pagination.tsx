"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useJobStore } from "@/store/job-store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  totalItems: number;
}

export function Pagination({ totalItems }: PaginationProps) {
  const { currentPage, itemsPerPage, setCurrentPage, setItemsPerPage } =
    useJobStore();

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPageButtons = () => {
    const pages: (number | string)[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (showEllipsisStart) {
        pages.push("...");
      }

      const start = showEllipsisStart ? Math.max(2, currentPage - 1) : 2;
      const end = showEllipsisEnd
        ? Math.min(totalPages - 1, currentPage + 1)
        : totalPages - 1;

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (showEllipsisEnd) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (page === "...") {
        return (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-slate-400 dark:text-slate-500"
          >
            ...
          </span>
        );
      }

      return (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(page as number)}
          className={
            page === currentPage
              ? "bg-indigo-600 hover:bg-indigo-700"
              : ""
          }
        >
          {page}
        </Button>
      );
    });
  };

  return (
    <div className="flex flex-col gap-4 py-4 border-t border-slate-200 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      {/* Items info */}
      <div className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
        Showing {startItem}-{endItem} of {totalItems} jobs
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1 justify-center flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {renderPageButtons()}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Items per page */}
      <div className="flex items-center gap-2 justify-center sm:justify-end">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Per page:
        </span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(v) => setItemsPerPage(parseInt(v))}
        >
          <SelectTrigger className="w-20 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
