"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  FileText,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { RadarLogo } from "@/components/radar-logo";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useJobStore } from "@/store/job-store";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Discovery",
    href: "/dashboard/discovery",
    icon: Compass,
  },
  {
    name: "Search Config",
    href: "/dashboard/search",
    icon: Search,
  },
  {
    name: "Saved Jobs",
    href: "/dashboard/saved",
    icon: Bookmark,
  },
  {
    name: "Applications",
    href: "/dashboard/applications",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useJobStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setSidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      {/* Mobile Toggle - hidden on mobile, we use bottom nav instead */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden hidden"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out",
          "bg-sidebar border-r border-border",
          "flex flex-col",
          sidebarOpen ? "w-64" : isMobile ? "-translate-x-full w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "h-16 flex items-center px-4 border-b border-border",
            sidebarOpen ? "justify-between" : "justify-center"
          )}
        >
          {sidebarOpen || isMobile ? (
            <RadarLogo size="sm" />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
          )}

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hidden lg:flex"
              onClick={toggleSidebar}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  !sidebarOpen && "rotate-180"
                )}
              />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <TooltipProvider delayDuration={0}>
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                            "hover:bg-slate-100 dark:hover:bg-slate-800",
                            isActive &&
                              "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
                            !isActive && "text-slate-600 dark:text-slate-400",
                            !sidebarOpen && !isMobile && "justify-center px-2"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5 flex-shrink-0",
                              isActive &&
                                "text-indigo-600 dark:text-indigo-400"
                            )}
                          />
                          {(sidebarOpen || isMobile) && (
                            <span className="font-medium">{item.name}</span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {!sidebarOpen && !isMobile && (
                        <TooltipContent side="right">
                          <p>{item.name}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </TooltipProvider>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div
            className={cn(
              "flex items-center gap-3",
              !sidebarOpen && !isMobile && "justify-center"
            )}
          >
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-medium">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {(sidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
