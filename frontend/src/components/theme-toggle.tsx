"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Cycle through themes: light -> dark -> system -> light
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);

    // Reset animation state after transition
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className={cn(
              "h-9 w-9 relative overflow-hidden",
              "hover:bg-accent/50 transition-colors duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            disabled={isAnimating}
          >
            {/* Icon with rotation animation */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "transition-all duration-300 ease-in-out",
                isAnimating && "animate-theme-spin"
              )}
            >
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-indigo-400" />
              ) : theme === "light" ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </div>
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900"
        >
          <p className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" />
            <span>
              {theme === "system"
                ? "System theme"
                : theme === "dark"
                ? "Dark mode"
                : "Light mode"}
            </span>
          </p>
          <p className="text-xs opacity-70 mt-0.5">Click to switch</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Dropdown version for more control
export function ThemeDropdown() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="h-9 w-9 hover:bg-accent/50 transition-colors duration-300"
            >
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-indigo-400" />
              ) : theme === "light" ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Change theme</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 rounded-lg bg-card border border-border shadow-lg z-50 animate-scale-in">
            <div className="p-1">
              {themes.map((t) => {
                const ThemeIcon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => {
                      setTheme(t.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      theme === t.value
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <ThemeIcon
                      className={cn(
                        "h-4 w-4",
                        t.value === "dark" && "text-indigo-400",
                        t.value === "light" && "text-amber-500",
                        t.value === "system" && "text-slate-500"
                      )}
                    />
                    <span>{t.label}</span>
                    {theme === t.value && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
