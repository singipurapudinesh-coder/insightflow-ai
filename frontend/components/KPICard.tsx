"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatPercent } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  trendPct?: number | null;
  trendLabel?: string;
  subtitle?: string;
  icon: React.ElementType;
  colorScheme?: "indigo" | "emerald" | "amber" | "violet" | "blue";
}

export function KPICard({
  title,
  value,
  trendPct,
  trendLabel = "vs last period",
  subtitle,
  icon: Icon,
  colorScheme = "indigo",
}: KPICardProps) {
  const isPositive = trendPct !== undefined && trendPct !== null && trendPct > 0;
  const isNegative = trendPct !== undefined && trendPct !== null && trendPct < 0;

  const colorStyles = {
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-950/50 dark:text-violet-400 border-violet-100 dark:border-violet-900/50",
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${colorStyles[colorScheme]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          {trendPct !== undefined && trendPct !== null ? (
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isPositive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                  : isNegative
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              <span>{formatPercent(trendPct)}</span>
            </div>
          ) : null}

          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {subtitle || trendLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

