// "use client";

// import { ReactNode, useState, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import { useAuth } from "@/components/auth-provider";
// import { useJobStore } from "@/store/job-store";
// import { Sidebar } from "./sidebar";
// import { Header } from "./header";
// import { FilterSidebar } from "./filter-sidebar";
// import { MobileNav } from "./mobile-nav";
// import { cn } from "@/lib/utils";

// interface DashboardLayoutProps {
//   children: ReactNode;
// }

// export function DashboardLayout({ children }: DashboardLayoutProps) {
//   const pathname = usePathname();
//   const { user, isLoading } = useAuth();
//   const { sidebarOpen, filterSidebarOpen, setFilterSidebarOpen } = useJobStore();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (user === null && !isLoading) {
//       window.location.href = "/auth/signin";
//     }
//   }, [user, isLoading]);

//   if (!mounted || isLoading || !user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950">
//         <div className="flex flex-col items-center gap-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
//           <p className="text-slate-500 dark:text-slate-400">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
//       {/* Background Pattern */}
//       <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-cyan-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950 pointer-events-none" />

//       <div className="relative flex">
//         {/* Sidebar */}
//         <Sidebar />

//         {/* Main Content */}
//         <div
//           className={cn(
//             "flex-1 flex flex-col min-h-screen transition-all duration-300",
//             sidebarOpen ? "lg:ml-64" : "lg:ml-16"
//           )}
//         >
//           {/* Header */}
//           <Header onFilterToggle={() => setFilterSidebarOpen(!filterSidebarOpen)} />

//           {/* Page Content */}
//           <main className="flex-1 p-4 lg:p-6 pb-24 sm:pb-6">
//             {children}
//           </main>
//         </div>

//         {/* Filter Sidebar */}
//         <FilterSidebar
//           open={filterSidebarOpen}
//           onClose={() => setFilterSidebarOpen(false)}
//         />

//         {/* Mobile Bottom Navigation */}
//         <MobileNav />
//       </div>
//     </div>
//   );
// }































"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useJobStore } from "@/store/job-store";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { FilterSidebar } from "./filter-sidebar";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { sidebarOpen, filterSidebarOpen, setFilterSidebarOpen } = useJobStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user === null && !isLoading) {
      window.location.href = "/auth/signin";
    }
  }, [user, isLoading]);

  if (!mounted || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-cyan-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950 pointer-events-none" />

      <div className="relative flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content - UPDATED MARGINS TO MATCH SIDEBAR */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-screen transition-all duration-300",
            sidebarOpen ? "lg:ml-52" : "lg:ml-16" // Changed from ml-64 to ml-52
          )}
        >
          {/* Header */}
          <Header onFilterToggle={() => setFilterSidebarOpen(!filterSidebarOpen)} />

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6 pb-24 sm:pb-6">
            {/* UPDATED: Better container with responsive padding */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
              {children}
            </div>
          </main>
        </div>

        {/* Filter Sidebar */}
        <FilterSidebar
          open={filterSidebarOpen}
          onClose={() => setFilterSidebarOpen(false)}
        />

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}