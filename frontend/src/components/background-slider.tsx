"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Slide {
  url: string;
  title: string;
  subtitle: string;
}

const slides: Slide[] = [
  {
    url: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Discover Your Next Opportunity",
    subtitle: "AI-powered job matching that finds roles tailored to your skills",
  },
  {
    url: "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Smart Job Discovery",
    subtitle: "Crawl and aggregate listings from across the web in one place",
  },
  {
    url: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Track Every Application",
    subtitle: "Keep your job search organized with powerful tracking tools",
  },
  {
    url: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Match Score Analytics",
    subtitle: "See how well each job fits your profile before you apply",
  },
  {
    url: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Remote-First Search",
    subtitle: "Filter by worldwide, regional, hybrid, or onsite opportunities",
  },
];

interface BackgroundSliderProps {
  interval?: number;
  className?: string;
}

export function BackgroundSlider({
  interval = 6000,
  className,
}: BackgroundSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(new Set([0]));

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval]);

  useEffect(() => {
    setLoaded((prev) => new Set(prev).add(currentIndex));
  }, [currentIndex]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        const isPreloaded = loaded.has(index);

        return (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-[2000ms] ease-in-out",
              isActive ? "opacity-100" : "opacity-0"
            )}
          >
            {isPreloaded && (
              <img
                src={slide.url}
                alt=""
                aria-hidden="true"
                className={cn(
                  "h-full w-full object-cover transition-transform duration-[7000ms] ease-out",
                  isActive ? "scale-110" : "scale-100"
                )}
              />
            )}
          </div>
        );
      })}

      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/60 dark:from-slate-950/95 dark:via-slate-950/85 dark:to-slate-950/70" />

      {/* Subtle bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/80 to-transparent" />
    </div>
  );
}

export { slides as sliderSlides };
