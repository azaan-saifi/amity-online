import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  className?: string;
}

const StatCard = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  className,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <h4 className="mt-2 text-3xl font-bold text-white">{value}</h4>

          {change && (
            <div className="mt-2 flex items-center">
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-emerald-500" : "text-rose-500"
                )}
              >
                {isPositive ? "+" : ""}
                {change}
              </span>
              <span className="ml-1 text-xs text-zinc-400">vs last month</span>
            </div>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffc20b31] text-[#f0bb1c]">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
