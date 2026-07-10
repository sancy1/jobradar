"use client";

import { Radar } from "lucide-react";

interface RadarLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeConfig = {
  sm: { icon: "h-6 w-6", text: "text-xl" },
  md: { icon: "h-8 w-8", text: "text-2xl" },
  lg: { icon: "h-10 w-10", text: "text-3xl" },
};

export function RadarLogo({ size = "md", showText = true }: RadarLogoProps) {
  const config = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Radar className={`${config.icon} text-indigo-600 dark:text-indigo-400`} />
        <div className="absolute inset-0 animate-pulse-ring">
          <Radar
            className={`${config.icon} text-indigo-600 dark:text-indigo-400 opacity-30`}
          />
        </div>
      </div>
      {showText && (
        <span
          className={`${config.text} font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-cyan-400`}
        >
          JobRadar
        </span>
      )}
    </div>
  );
}
