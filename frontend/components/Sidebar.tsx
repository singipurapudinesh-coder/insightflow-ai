"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Bot,
  LineChart,
  FileText,
  Settings,
  HelpCircle,
  Database,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { getCurrentDatasetInfo } from "@/lib/api";

export function Sidebar() {
  const pathname = usePathname();
  const [datasetInfo, setDatasetInfo] = useState<{ name: string; row_count: number } | null>(null);

  useEffect(() => {
    getCurrentDatasetInfo().then((info) => {
      if (info) setDatasetInfo(info);
    });
  }, [pathname]);

  const navigation = [
    { name: "Executive Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Data Exploration", href: "/analyze", icon: FileSpreadsheet },
    { name: "AI Copilot Chat", href: "/copilot", icon: Bot },
    { name: "Reports & Exports", href: "/reports", icon: FileText },
    { name: "Settings & Config", href: "/settings", icon: Settings },
  ];

  const copilotPrompts = [
    "Which region has the highest profit?",
    "Top 5 sub-categories by sales",
    "Average discount vs margin impact",
  ];

  return (
    <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <div className="p-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Analytics Hub
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Suggested Copilot Queries */}
      <div className="p-4 mt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Quick Prompts
          </span>
          <Bot className="h-3.5 w-3.5 text-indigo-500" />
        </div>
        <div className="space-y-1.5">
          {copilotPrompts.map((prompt, idx) => (
            <Link
              key={idx}
              href={`/copilot?q=${encodeURIComponent(prompt)}`}
              className="group block p-2 rounded-lg bg-slate-50 hover:bg-indigo-50/80 dark:bg-slate-900 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {prompt}
                </span>
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity shrink-0 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dataset Info Box */}
      <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-slate-900 dark:to-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40">
          <div className="flex items-center gap-2 mb-1.5">
            <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Active Dataset
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate" title={datasetInfo?.name || "sales_sample.csv"}>
            {datasetInfo?.name || "sales_sample.csv"}
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{datasetInfo?.row_count !== undefined ? `${datasetInfo.row_count} Rows` : "600 Rows"}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verified Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

