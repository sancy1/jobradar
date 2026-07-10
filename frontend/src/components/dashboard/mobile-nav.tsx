"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Bookmark,
  FileText,
  User,
  Search,
  Compass,
  Settings,
  Bell,
  ChevronUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Saved", href: "/dashboard/saved", icon: Bookmark },
  { name: "Apply", href: "/dashboard/applications", icon: FileText },
  { name: "Profile", href: "/dashboard/settings", icon: User },
];

const slideUpItems = [
  { name: "Discovery", href: "/dashboard/discovery", icon: Compass },
  { name: "Search Config", href: "/dashboard/search", icon: Search },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Slide-up Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden animate-in fade-in duration-200"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-up Menu */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 sm:hidden",
          "bg-background border-t border-border rounded-t-2xl shadow-2xl",
          "transition-transform duration-300 ease-out",
          menuOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="px-4 pb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">More Options</h3>
          <button
            onClick={() => setMenuOpen(false)}
            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 p-4 pb-8">
          {slideUpItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl min-h-[80px] justify-center",
                  "transition-colors touch-target",
                  active
                    ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 sm:hidden",
          "bg-background/95 backdrop-blur-md border-t border-border",
          "pb-[env(safe-area-inset-bottom)]"
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {/* Home */}
          <NavTab
            item={bottomNavItems[0]}
            active={isActive(bottomNavItems[0].href)}
          />

          {/* Saved */}
          <NavTab
            item={bottomNavItems[1]}
            active={isActive(bottomNavItems[1].href)}
          />

          {/* Center FAB - Search */}
          <div className="flex flex-col items-center -mt-6">
            <Link
              href="/dashboard/search"
              className={cn(
                "flex items-center justify-center",
                "h-14 w-14 rounded-full",
                "bg-gradient-to-br from-indigo-500 to-cyan-500",
                "shadow-lg shadow-indigo-500/30",
                "text-white transition-transform active:scale-95",
                "touch-target"
              )}
              aria-label="Search"
            >
              <Search className="h-6 w-6" />
            </Link>
          </div>

          {/* Apply */}
          <NavTab
            item={bottomNavItems[2]}
            active={isActive(bottomNavItems[2].href)}
          />

          {/* Profile / More */}
          <NavTab
            item={bottomNavItems[3]}
            active={isActive(bottomNavItems[3].href)}
          />
        </div>
      </nav>
    </>
  );
}

function NavTab({
  item,
  active,
}: {
  item: { name: string; href: string; icon: typeof Home };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center gap-1",
        "min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg",
        "transition-colors touch-target",
        active
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-muted-foreground"
      )}
    >
      <Icon
        className={cn("h-5 w-5", active && "fill-indigo-100 dark:fill-indigo-950")}
      />
      <span
        className={cn(
          "text-[10px] font-medium leading-none",
          active && "font-semibold"
        )}
      >
        {item.name}
      </span>
      {active && (
        <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-indigo-600 dark:bg-indigo-400" />
      )}
    </Link>
  );
}
