"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles, Database, BarChart3, FileSpreadsheet, Bot, FileText, Settings, ExternalLink, Trash2, Menu, X } from "lucide-react";
import { HealthBadge } from "./HealthBadge";
import { getCurrentDatasetInfo } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const [datasetInfo, setDatasetInfo] = useState<{ name: string; row_count: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getCurrentDatasetInfo().then((info) => {
      if (info) setDatasetInfo(info);
    });
  }, [pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Overview", href: "/", icon: BarChart3 },
    { name: "Dashboard", href: "/dashboard", icon: Sparkles },
    { name: "Analyze", href: "/analyze", icon: FileSpreadsheet },
    { name: "Copilot", href: "/copilot", icon: Bot },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform border border-blue-500/30">
              <Image
                src="/app-icon.png"
                alt="InsightFlow AI Icon"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                InsightFlow<span className="text-blue-500 dark:text-blue-400">.ai</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                BI Copilot
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Dataset Pill with Remove/Reset Action (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <Database className="h-3 w-3 text-indigo-500" />
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
              {datasetInfo?.name || "sales_sample.csv"}
            </span>
            <span className="text-slate-400">
              • {datasetInfo?.row_count ? `${datasetInfo.row_count} rows` : "600 rows"}
            </span>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm("Remove current dataset and reset to default sample dataset?")) {
                  try {
                    const res = await (await import("@/lib/api")).resetDataset();
                    setDatasetInfo({ name: res.filename, row_count: res.row_count });
                    window.location.reload();
                  } catch (err: any) {
                    alert("Failed to reset dataset: " + err.message);
                  }
                }
              }}
              className="ml-1 p-0.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Remove dataset / Reset to default"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          {/* Backend Connectivity Status */}
          <HealthBadge />

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center rounded-lg text-xs font-semibold px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            Sign In
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center justify-center rounded-lg text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all shadow-blue-500/25"
          >
            Launch Copilot
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-3 animate-fadeIn">
          {/* Active Dataset Pill (Mobile) */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <Database className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {datasetInfo?.name || "sales_sample.csv"}
              </span>
              <span className="text-slate-400 shrink-0">
                ({datasetInfo?.row_count ? `${datasetInfo.row_count} rows` : "600 rows"})
              </span>
            </div>
            <button
              onClick={async () => {
                if (window.confirm("Remove current dataset and reset to default sample dataset?")) {
                  try {
                    const res = await (await import("@/lib/api")).resetDataset();
                    setDatasetInfo({ name: res.filename, row_count: res.row_count });
                    window.location.reload();
                  } catch (err: any) {
                    alert("Failed to reset dataset: " + err.message);
                  }
                }
              }}
              className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer shrink-0"
              title="Reset Dataset"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4 text-indigo-500" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Action Buttons */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center rounded-lg text-sm font-semibold py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center rounded-lg text-sm font-semibold py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              Launch Copilot
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

