"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  BarChart3,
  Bot,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Cpu
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: FileSpreadsheet,
      title: "CSV & Excel Ingestion",
      desc: "Instant data-quality profiling, missing-value audits, and schema detection for business datasets.",
    },
    {
      icon: Bot,
      title: "Grounded AI Copilot",
      desc: "Ask questions in natural English ('Which region had the highest profit?') and get precise numerical answers.",
    },
    {
      icon: BarChart3,
      title: "Dynamic KPI Dashboards",
      desc: "Live revenue, margins, and sales breakdown computed directly with Pandas and NumPy with zero hardcoded values.",
    },
    {
      icon: TrendingUp,
      title: "Machine Learning Forecasts",
      desc: "Baseline time-series projections, anomaly detection, and growth trend analysis powered by Scikit-learn.",
    },
  ];

  const techStack = [
    { label: "Frontend", name: "Next.js 16 + React 19 + TypeScript" },
    { label: "Styling", name: "Tailwind CSS + Recharts" },
    { label: "Backend API", name: "Python FastAPI + Uvicorn" },
    { label: "Data Engine", name: "Pandas + NumPy + Scikit-learn" },
    { label: "Deployment", name: "Vercel (UI) + Render (API)" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Next-Generation Business Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Turn Spreadsheets into{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
              Actionable Intelligence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Upload CSV or Excel files, ask questions in plain English, and receive instant KPI dashboards, automated charts, and machine-learning forecasts.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
              <span>Upload Dataset</span>
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Zero hardcoded KPIs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              <span>Grounded Copilot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>FastAPI & Pandas Powered</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Graphic Card */}
        <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 text-left">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="ml-2 text-xs font-mono text-slate-400">insightflow-ai.app/dashboard</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Live Superstore Analytics
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-left">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Total Revenue</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">$1,285,690</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">+14.8% growth</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Net Profit</span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">$161,474</div>
              <span className="text-xs text-slate-500 mt-1 inline-block">12.56% margin</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Total Orders</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">600</div>
              <span className="text-xs text-slate-500 mt-1 inline-block">$2,142 AOV</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Data Quality</span>
              <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">99.8%</div>
              <span className="text-xs text-slate-500 mt-1 inline-block">0 missing values</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Complete Business Intelligence Lifecycle
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
              From raw tabular data ingestion to AI-assisted synthesis and time-series projections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-6 hover:shadow-lg transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recommended Tech Stack Architecture */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white p-8 sm:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                Production Architecture
              </span>
              <h3 className="text-2xl font-bold mt-1">Engineered for Vercel + Render Deployment</h3>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-semibold text-white transition-colors"
            >
              Open Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            {techStack.map((tech, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
                  {tech.label}
                </span>
                <span className="text-sm font-medium text-slate-200 mt-1 block">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 InsightFlow AI — Business Intelligence Copilot. Designed for high-scale analytical portfolios.</p>
      </footer>
    </div>
  );
}
