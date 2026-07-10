"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, SlidersHorizontal, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useJobStore } from "@/store/job-store";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  onFilterToggle?: () => void;
}

export function Header({ onFilterToggle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { setSearchQuery, searchQuery } = useJobStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="h-16 bg-background border-b border-border px-4 lg:px-6 flex items-center justify-between gap-2">
      {/* Left section - Search */}
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            type="text"
            placeholder="Search jobs... (Ctrl+F)"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 bg-muted border-border focus:border-primary focus:ring-primary h-9"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onFilterToggle}
          className="hidden lg:flex"
        >
          <span>Filters</span>
          {useJobStore.getState().getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {useJobStore.getState().getActiveFilterCount()}
            </Badge>
          )}
        </Button>

        {/* Mobile Filter Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onFilterToggle}
          className="lg:hidden h-9 w-9"
        >
          <SlidersHorizontal className="h-5 w-5" />
          {useJobStore.getState().getActiveFilterCount() > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-indigo-500 text-xs text-white flex items-center justify-center">
              {useJobStore.getState().getActiveFilterCount()}
            </span>
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">New Match</Badge>
                </div>
                <p className="text-sm font-medium">Senior Developer at Stripe</p>
                <p className="text-xs text-slate-500">95% match - 2 hours ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Saved</Badge>
                </div>
                <p className="text-sm font-medium">Staff Engineer at Figma</p>
                <p className="text-xs text-slate-500">Position closing soon</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Update</Badge>
                </div>
                <p className="text-sm font-medium">Application status changed</p>
                <p className="text-xs text-slate-500">Linear - Backend Engineer</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-sm text-indigo-600 dark:text-indigo-400">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-medium">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-medium">{user?.name || "User"}</span>
              </div>
              <ChevronDown className="h-4 w-4 hidden lg:block text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name}</span>
                <span className="text-xs font-normal text-slate-500">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600 dark:text-red-400">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
